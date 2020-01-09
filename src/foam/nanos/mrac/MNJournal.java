/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import foam.dao.FileJournal;
import foam.core.X;
import foam.dao.DAO;
import foam.core.FObject;
import foam.lib.json.Outputter;
import foam.util.SafetyUtil;

import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.channels.SocketChannel;
import java.nio.file.StandardOpenOption;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.nio.channels.SelectionKey;
import java.nio.charset.Charset;

import java.io.IOException;

import java.util.Map;
import java.util.HashMap;

import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

public class MNJournal extends FileJournal {

  private static FileSystem fileSystem = FileSystems.getDefault();

  private String journalDir;
  private String filename;
  private FileChannel outChannel;
  private Object fileLock = new Object();
  private long lateIndex;
  // To avoid we need to create ByteBuffer everyTime when we write.
  // Allocate 20KB.
  private ByteBuffer writeBuffer = ByteBuffer.allocate(20 * 1024);

  private MNJournal(String filename) {
    try {
      this.filename = filename;
      this.journalDir = System.getProperty("JOURNAL_HOME");
      this.outChannel = FileChannel.open(getPath(filename), StandardOpenOption.CREATE, StandardOpenOption.APPEND);

    } catch ( IOException e ) {
      throw new RuntimeException(e);
    }
  }

  private Path getPath(String name) {
    return SafetyUtil.isEmpty(journalDir) ? fileSystem.getPath(name) : fileSystem.getPath(journalDir, name);
  }


  @Override
  public FObject put(X x, String prefix, DAO dao, FObject obj) {
    System.out.println("MNPut");
    MedusaEntry entry = (MedusaEntry) obj;
    entry.setAction("p");
    String hash1 = entry.getHash1();
    String hash2 = entry.getHash2();
    //TODO: Do not hard code SHA-256.
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      md.update(hash1.getBytes(StandardCharsets.UTF_8));
      md.update(hash2.getBytes(StandardCharsets.UTF_8));
      String myHash = byte2Hex(entry.getNu().hash(md));
      entry.setMyHash(myHash);
    } catch ( Exception e ) {
      System.out.println(e);
      throw new RuntimeException(e);
    }
    String msg = new Outputter(x).stringify(obj);
    doWrite(x, msg + "\n");
    return obj;
  }

  @Override
  public FObject remove(X x, String prefix, DAO dao, FObject obj) {
    MedusaEntry entry = (MedusaEntry) obj;
    entry.setAction("r");
    String hash1 = entry.getHash1();
    String hash2 = entry.getHash2();
    //TODO: Do not hard code SHA-256.
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      md.update(hash1.getBytes(StandardCharsets.UTF_8));
      md.update(hash2.getBytes(StandardCharsets.UTF_8));
      String myHash = byte2Hex(entry.getNu().hash(md));
      entry.setMyHash(myHash);
    } catch ( Exception e ) {
      System.out.println(e);
      throw new RuntimeException(e);
    }
    doWrite(x, new Outputter(x).stringify(obj) + "\n");
    return obj;
  }

  private void doWrite(X x, String record) {
    try {
      synchronized ( fileLock ) {
        writeBuffer.clear();
        byte[] bytes = record.getBytes(Charset.forName("UTF-8"));
        writeBuffer.putInt(bytes.length);
        writeBuffer.put(bytes);
        writeBuffer.flip();
        while ( writeBuffer.hasRemaining() ) {
          outChannel.write(writeBuffer);
        }
      }
    } catch ( IOException ioe ) {
      throw new RuntimeException(ioe);
    }
  }

  private static Map<String, MNJournal> journalMap = new HashMap<String, MNJournal>();

  public synchronized static MNJournal getMNjournal(String serviceName) {
    if ( journalMap.get(serviceName) != null ) return journalMap.get(serviceName);
    journalMap.put(serviceName, new MNJournal(serviceName));
    return journalMap.get(serviceName);
  }

  // Send back all data now.
  // I can get outside of this call.
  public void replay(X x, DAO dao) {
    //TODO: create a SocketChannelDAO. And use it to send File.
    //TODO: SocketChannel should put into X.
    //TODO: create special sink and add to the dao. Use to deal with inflight request.

    SelectionKey key = (SelectionKey) x.get("selectionKey");
    SocketChannel socketChannel = (SocketChannel) key.channel();

    if ( key == null ) throw new RuntimeException("SelectionKey do not find.");
    if ( socketChannel == null ) throw new RuntimeException("SocketChannel do not find");
    //TODO: create a special sink and add this socketChannel in.

    try {
      long position = -1;
      FileChannel inChannel = FileChannel.open(getPath(filename), StandardOpenOption.CREATE, StandardOpenOption.READ);

      // We can synchronize whole below code using fileLock,
      // but it is inefficient.
      // We can just sync and get file size. and build sink attach to the DAO.
      // This way we can do replay and write in parallel.
      // TODO: sync below code for now.
      synchronized ( fileLock ) {
        position = inChannel.size();

        // Allocate 500M.
        // TODO: make sure memory assign to this instance is bigger enough.
        // ByteBuffer byteBuffer = ByteBuffer.allocate(524288000);
        int blockSize = 1024;
        ByteBuffer byteBuffer = ByteBuffer.allocate(blockSize);
        ByteBuffer lengthBuffer = ByteBuffer.allocate(4);
        int length = -1;

        int totalBlock = (int) Math.ceil( (position/(double)blockSize));

        // Send ACK to MM.
        FilePacket filePacket = new FilePacket();
        filePacket.setTotalBlock(totalBlock);
        Outputter outputter = new Outputter(x);
        String msg = outputter.stringify(filePacket);
        System.out.println(msg);
        byte[] bytes = msg.getBytes(Charset.forName("UTF-8"));
        ByteBuffer ackBuffer = ByteBuffer.allocate(4 + bytes.length);
        ackBuffer.putInt(bytes.length);
        ackBuffer.put(bytes);
        ackBuffer.flip();
        socketChannel.write(ackBuffer);

        while ( inChannel.position() < position ) {
          lengthBuffer.clear();
          byteBuffer.clear();
          length = inChannel.read(byteBuffer);
          lengthBuffer = lengthBuffer.putInt(length);

          byteBuffer.flip();
          lengthBuffer.flip();

          while ( lengthBuffer.hasRemaining() ) { socketChannel.write(lengthBuffer); }
          while ( byteBuffer.hasRemaining() ) { socketChannel.write(byteBuffer); }

        }

        //TODO: send finish ack
        //TODO: activate sink;
      }

    } catch ( IOException e ) {
      try {
        socketChannel.close();
        key.cancel();
      } catch ( IOException ie ) {
        //TODO: log error.
      }
    }
  }

  public static String byte2Hex(byte[] bytes){
    StringBuffer stringBuffer = new StringBuffer();
    String temp = null;
    for (int i=0;i<bytes.length;i++){
      temp = Integer.toHexString(bytes[i] & 0xFF);
      if (temp.length()==1){
        stringBuffer.append("0");
      }
      stringBuffer.append(temp);
    }
    return stringBuffer.toString();
  }
}
