/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

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
import java.io.InputStream;
import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.ByteArrayInputStream;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.LinkedList;

import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import static foam.mlang.MLang.*;
import foam.dao.ArraySink;
import foam.lib.json.JSONParser;
import foam.mlang.order.Desc;
import foam.nanos.logger.Logger;


// This class is different implementation of MNJournal.
public class MNFJournal extends FileJournal {

  private static FileSystem fileSystem = FileSystems.getDefault();

  private String journalDir;
  private String filename;
  private FileChannel outChannel;
  private Object fileLock = new Object();
  private DAO fileMetaDAO;
  private volatile boolean isReady;

  // To avoid we need to create ByteBuffer everyTime when we write.
  // Allocate 20KB.
  private ByteBuffer writeBuffer = ByteBuffer.allocate(40 * 1024);
  private long maxGlobalIndex = Long.MIN_VALUE;
  private long minGlobalIndex = Long.MAX_VALUE;
  private int fileIndex = 1;
  private int fileSize;
  private FileMeta lastFileMeta;
  private int entryCount = 0;
  private Logger logger;
  private MNFJournal(X x, String filename) {
    try {
      setX(x);
      logger = (Logger) x.get("logger");
      fileMetaDAO = (DAO) x.get("fileMetaDAO");
      if ( fileMetaDAO == null ) throw new RuntimeException("fileMetaDAO miss");
      this.filename = filename;

      this.journalDir = System.getProperty("JOURNAL_HOME");

      //load min and max index;
      ArraySink sink = (ArraySink) fileMetaDAO
                                    .where(EQ(EntryRecord.FILE_NAME, filename))
                                    .orderBy(FileMeta.POST_FIX)
                                    .select(new ArraySink());
      List list = sink.getArray();

      for ( Object obj : list ) {
        lastFileMeta = (FileMeta) obj;
        if ( lastFileMeta.getMaxIndex() > maxGlobalIndex ) {
          maxGlobalIndex = lastFileMeta.getMaxIndex();
        }
        if ( lastFileMeta.getMinIndex() < minGlobalIndex ) {
          minGlobalIndex = lastFileMeta.getMinIndex();
        }
        fileIndex = lastFileMeta.getPostFix();
      }

      if ( lastFileMeta == null ) {
        // Create new file
        FileMeta fileMeta = new FileMeta();
        fileMeta.setFilename(filename);
        fileMeta.setPostFix(fileIndex);
        fileMeta.setMaxIndex(Long.MIN_VALUE);
        fileMeta.setMinIndex(Long.MAX_VALUE);
        fileMeta.setTotalEntry(0);
        lastFileMeta = (FileMeta) fileMetaDAO.put_(x, fileMeta);
        this.outChannel = FileChannel.open(getPath(filename + "_" + String.valueOf(fileIndex)), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        fileSize = 0;
      } else {
        // verify file.
        // check the last file.
        FileChannel inChannel = FileChannel.open(getPath(filename + "_" + String.valueOf(lastFileMeta.getPostFix())), StandardOpenOption.READ);
        fileSize = (int) inChannel.size();
        int bufferSize = fileSize;

        ByteBuffer byteBuffer = ByteBuffer.allocate(bufferSize);
        inChannel.read(byteBuffer);
        byteBuffer.flip();
        BufferedReader reader = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(byteBuffer.array())));

        String line;

        // Entry in MN do not support multi-line.
        while( ( line = reader.readLine() ) != null ) {
          if ( "".equals(line.trim()) ) continue;
          MedusaEntry entry = (MedusaEntry) getX().create(JSONParser.class).parseString(line);
          if ( entry.getMyIndex() < minGlobalIndex ) minGlobalIndex = entry.getMyIndex();
          if ( entry.getMyIndex() > maxGlobalIndex ) maxGlobalIndex = entry.getMyIndex();
          entryCount++;
        }

        this.outChannel = FileChannel.open(getPath(filename + "_" + String.valueOf(fileIndex)), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
      }

      logger.info(maxGlobalIndex);
    } catch ( IOException e ) {
      throw new RuntimeException(e);
    }
  }

  public long getCurrentMaxIndex() {
    return maxGlobalIndex;
  }

  private Path getPath(String name) {
    return SafetyUtil.isEmpty(journalDir) ? fileSystem.getPath(name) : fileSystem.getPath(journalDir, name);
  }

  @Override
  public FObject put(X x, String prefix, DAO dao, FObject obj) {
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
       logger.info(e);
       throw new RuntimeException(e);
     }
    String msg = new Outputter(x).stringify(obj);
    doWrite(x, msg + "\n", entry.getMyIndex());
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
      logger.info(e);
      throw new RuntimeException(e);
    }
    doWrite(x, new Outputter(x).stringify(obj) + "\n", entry.getMyIndex());
    return obj;
  }

  //TODO: make it bigger.
  private static final int FILESIZE_IN_BYTE = 1024;

  private void doWrite(X x, String record, long globalIndex) {

    try {
      synchronized ( fileLock ) {
        if ( fileSize > FILESIZE_IN_BYTE ) {
          // update lastFileMeta.
          lastFileMeta.setTotalEntry(entryCount);
          lastFileMeta.setMaxIndex(maxGlobalIndex);
          lastFileMeta.setMinIndex(minGlobalIndex);
          fileMetaDAO.put_(x, lastFileMeta);

          entryCount = 0;
          fileIndex++;
          fileSize = 0;
          maxGlobalIndex = Long.MIN_VALUE;
          minGlobalIndex = Long.MAX_VALUE;
          // create noe FileMeta.
          FileMeta fileMeta = new FileMeta();
          fileMeta.setFilename(filename);
          fileMeta.setPostFix(fileIndex);
          fileMeta.setMaxIndex(Long.MIN_VALUE);
          fileMeta.setMinIndex(Long.MAX_VALUE);
          fileMeta.setTotalEntry(0);
          lastFileMeta = (FileMeta) fileMetaDAO.put_(x, fileMeta);

          this.outChannel = FileChannel.open(getPath(filename + "_" + String.valueOf(fileIndex)), StandardOpenOption.CREATE, StandardOpenOption.APPEND);

        }

        if ( globalIndex > maxGlobalIndex ) {
          maxGlobalIndex = globalIndex;
        }
        if ( globalIndex < minGlobalIndex ) {
          minGlobalIndex = globalIndex;
        }

        writeBuffer.clear();
        byte[] bytes = record.getBytes(Charset.forName("UTF-8"));
        fileSize = fileSize + bytes.length;
        writeBuffer.put(bytes);
        writeBuffer.flip();
        while ( writeBuffer.hasRemaining() ) {
          outChannel.write(writeBuffer);
        }
        entryCount++;
      }
    } catch ( IOException ioe ) {
      throw new RuntimeException(ioe);
    }
  }

  private static Map<String, MNFJournal> journalMap = new HashMap<String, MNFJournal>();

  public synchronized static MNFJournal getMNjournal(X x, String serviceName) {
    if ( journalMap.get(serviceName) != null ) return journalMap.get(serviceName);
    journalMap.put(serviceName, new MNFJournal(x, serviceName));
    return journalMap.get(serviceName);
  }

  // Mediator should subscribe dao first before apply this method.
  public void replayFrom(X x, DAO dao, long indexFrom) {
    SelectionKey key = (SelectionKey) x.get("selectionKey");
    SocketChannel socketChannel = (SocketChannel) key.channel();

    if ( key == null ) throw new RuntimeException("SelectionKey do not find.");
    if ( socketChannel == null ) throw new RuntimeException("SocketChannel do not find");

    try {
      FileChannel inChannel = null;

      // We can synchronize whole below code using fileLock,
      // but it is inefficient.
      // We can just sync and get file size. and build sink attach to the DAO.
      // This way we can do replay and write in parallel.
      int readFileSize = 0;
      FileMeta readTo = null;
      synchronized ( fileLock ) {
        readTo = (FileMeta) lastFileMeta.fclone();
        inChannel = FileChannel.open(getPath(readTo.getFilename() + "_" + String.valueOf(fileIndex)), StandardOpenOption.READ);
        readFileSize = (int) inChannel.size();
      }

      ArraySink sink = (ArraySink) fileMetaDAO
          .where(EQ(FileMeta.FILENAME, filename))
          .orderBy(FileMeta.ID)
          .select(new ArraySink());

      List list = sink.getArray();
      // Journal will be send block by block to mediator.
      try {
        for ( Object obj : list ) {
          FileMeta fileMeta = (FileMeta) obj;

          if ( fileMeta.getId() == readTo.getId() ) continue;

          if ( fileMeta.getMinIndex() < indexFrom && fileMeta.getMaxIndex() < indexFrom ) {
            continue;
          }

          inChannel = FileChannel.open(getPath(fileMeta.getFilename() + "_" + String.valueOf(fileMeta.getPostFix())),StandardOpenOption.READ);
          int bufferSize = (int) inChannel.size();

          ByteBuffer byteBuffer = ByteBuffer.allocate(bufferSize);
          inChannel.read(byteBuffer);
          byteBuffer.flip();
          BufferedReader reader = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(byteBuffer.array())));
          //TODO: support multiline parse.
          String line;
          int count = 0;
          int totalSendingSize = 0;
          List<String> entries = new LinkedList<String>();

          // Do not support multi-line journal and comment.
          while ( ( line = reader.readLine() ) != null ) {
            if ( "".equals(line.trim()) ) continue;
            MedusaEntry entry = null;
            try {
              entry = (MedusaEntry) x.create(JSONParser.class).parseString(line);
              if ( entry.getMyIndex() < indexFrom ) continue;
              //TODO: hash check.
              Outputter outputter = new Outputter(x);
              String entryString = outputter.stringify(entry);
              //TODO: find a better way to implement this.
              byte[] bytes = entryString.getBytes(Charset.forName("UTF-8"));
              totalSendingSize = totalSendingSize + 4 + bytes.length;
              entries.add(entryString);
              count++;
            } catch ( Exception ioe ) {
              ioe.printStackTrace();
              //TODO: terminal reply, and send error message to mediator, and
              //stop this mmJournal until problem fix.
              BlockInfo blockInfo = new BlockInfo();
              blockInfo.setFileName(filename);
              blockInfo.setFilePostfix(fileMeta.getPostFix());
              blockInfo.setAnyFailure(true);
              blockInfo.setFailLine(line);
              blockInfo.setEof(true);
              blockInfo.setFailReason(ioe.toString());
              Outputter outputter = new Outputter(x);
              String blockInfoStr = outputter.stringify(blockInfo);
              byte[] blockInfoBytes = blockInfoStr.getBytes(Charset.forName("UTF-8"));
              int sendingSize = 4 + blockInfoBytes.length;
              ByteBuffer sendBuffer = ByteBuffer.allocate(sendingSize);
              // sendBuffer.putInt(sendingSize);
              sendBuffer.putInt(blockInfoBytes.length);
              sendBuffer.put(blockInfoBytes);
              sendBuffer.flip();
              while( sendBuffer.hasRemaining() ) { socketChannel.write(sendBuffer); }

              try {
                socketChannel.close();
                key.cancel();
              } catch ( IOException ie ) {
                ie.printStackTrace();
              }
              return;
            }
          }

          // Start to send block to mediator.
          BlockInfo blockInfo = new BlockInfo();
          blockInfo.setIsSort(false);
          blockInfo.setFileName(filename);
          blockInfo.setFilePostfix(fileMeta.getPostFix());
          blockInfo.setEof(false);
          blockInfo.setMaxIndex(fileMeta.getMaxIndex());
          blockInfo.setMinIndex(fileMeta.getMinIndex());
          blockInfo.setAnyFailure(false);
          blockInfo.setTotalEntries(count);
          Outputter outputter = new Outputter(x);
          String blockInfoStr = outputter.stringify(blockInfo);
          byte[] blockInfoBytes = blockInfoStr.getBytes(Charset.forName("UTF-8"));
          ByteBuffer sendBuffer = ByteBuffer.allocate(4 + blockInfoBytes.length + 4 + totalSendingSize);

          sendBuffer.putInt(blockInfoBytes.length);
          sendBuffer.put(blockInfoBytes);
          sendBuffer.putInt(totalSendingSize);
          for ( String entry : entries ) {
            byte[] bytes = entry.getBytes(Charset.forName("UTF-8"));
            sendBuffer.putInt(bytes.length);
            sendBuffer.put(bytes);
          }
          sendBuffer.flip();

          while ( sendBuffer.hasRemaining() ) { socketChannel.write(sendBuffer); }
        }

        // We need special for the last block of data.
        int bufferSize = readFileSize;
        ByteBuffer byteBuffer = ByteBuffer.allocate(bufferSize);
        inChannel = FileChannel.open(getPath(readTo.getFilename() + "_" + String.valueOf(readTo.getPostFix())), StandardOpenOption.READ);
        byteBuffer.flip();
        BufferedReader reader = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(byteBuffer.array())));

        String line;
        int count = 0;
        int totalSendingSize = 0;
        List<String> entries = new LinkedList<String>();
        long minIndex = Long.MAX_VALUE;
        long maxIndex = Long.MIN_VALUE;

        // Do not support multi-line journal and comment.
        while ( ( line = reader.readLine() ) != null ) {
          if ( "".equals(line.trim()) ) continue;
          MedusaEntry entry = null;
          try {
            entry = (MedusaEntry) x.create(JSONParser.class).parseString(line);
            if ( entry.getMyIndex() < indexFrom ) continue;
            if ( entry.getMyIndex() < minIndex ) minIndex = entry.getMyIndex();
            if ( entry.getMyIndex() > maxIndex ) maxIndex = entry.getMyIndex();
            //TODO: hash check.
            Outputter outputter = new Outputter(x);
            String entryString = outputter.stringify(entry);
            //TODO: find a better way to implement this.
            byte[] bytes = entryString.getBytes(Charset.forName("UTF-8"));
            totalSendingSize = totalSendingSize + 4 + bytes.length;
            entries.add(entryString);
            count++;
          } catch ( Exception ioe ) {
            ioe.printStackTrace();
            //TODO: terminal reply, and send error message to mediator, and
            //stop this mmJournal until problem fix.
            BlockInfo blockInfo = new BlockInfo();
            blockInfo.setFileName(filename);
            blockInfo.setFilePostfix(readTo.getPostFix());
            blockInfo.setAnyFailure(true);
            blockInfo.setFailLine(line);
            blockInfo.setEof(true);
            blockInfo.setFailReason(ioe.toString());
            Outputter outputter = new Outputter(x);
            String blockInfoStr = outputter.stringify(blockInfo);
            byte[] blockInfoBytes = blockInfoStr.getBytes(Charset.forName("UTF-8"));
            int sendingSize = 4 + blockInfoBytes.length;
            ByteBuffer sendBuffer = ByteBuffer.allocate(sendingSize);
            // sendBuffer.putInt(sendingSize);
            sendBuffer.putInt(blockInfoBytes.length);
            sendBuffer.put(blockInfoBytes);
            sendBuffer.flip();
            while( sendBuffer.hasRemaining() ) { socketChannel.write(sendBuffer); }

            try {
              ioe.printStackTrace();
              socketChannel.close();
              key.cancel();
            } catch ( IOException ie ) {
              //TODO: log
            }
            return;

          }
        }

        // Send last block to mediator.
        BlockInfo blockInfo = new BlockInfo();
        blockInfo.setIsSort(false);
        blockInfo.setFileName(filename);
        blockInfo.setFilePostfix(readTo.getPostFix());
        blockInfo.setEof(true);
        blockInfo.setMaxIndex(maxIndex);
        blockInfo.setMinIndex(minIndex);
        blockInfo.setAnyFailure(false);
        blockInfo.setTotalEntries(count);
        Outputter outputter = new Outputter(x);
        String blockInfoStr = outputter.stringify(blockInfo);
        byte[] blockInfoBytes = blockInfoStr.getBytes(Charset.forName("UTF-8"));
        ByteBuffer sendBuffer = ByteBuffer.allocate(4 + blockInfoBytes.length + 4 +totalSendingSize);

        sendBuffer.putInt(blockInfoBytes.length);
        sendBuffer.put(blockInfoBytes);
        sendBuffer.putInt(totalSendingSize);
        for ( String entry : entries ) {
          byte[] bytes = entry.getBytes(Charset.forName("UTF-8"));
          sendBuffer.putInt(bytes.length);
          sendBuffer.put(bytes);
        }
        sendBuffer.flip();

        while ( sendBuffer.hasRemaining() ) { socketChannel.write(sendBuffer); }

      } catch ( IOException ioe ) {
        //TODO: send error to mediator. Mediator should fail this node.
        //Terminator replay.
        try {
          socketChannel.close();
          key.cancel();
        } catch ( IOException ie ) {
          //TODO: log
        }
        return;
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

  // Send back all data now.
  // I can get outside of this call.
  public void replay(X x, DAO dao) {
    replayFrom(x, dao, 1L);
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

