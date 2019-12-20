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
import foam.util.SafetyUtil;

import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.channels.SocketChannel;
import java.nio.file.StandardOpenOption;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.nio.channels.SelectionKey;

import java.io.IOException;

public class MNJournal extends FileJournal {

  private static FileSystem fileSystem = FileSystems.getDefault();

  private String journalDir;
  private String filename;
  private FileChannel outChannel;
  private Object fileLock = new Object();
  private long lateIndex;

  public MNJournal(X x, String filename) throws IOException {
    setX(x);
    this.filename = filename;
    this.journalDir = System.getProperty("JOURNAL_HOME");
    this.outChannel = FileChannel.open(getPath(filename), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
  }

  private Path getPath(String name) {
    return SafetyUtil.isEmpty(journalDir) ? fileSystem.getPath(name) : fileSystem.getPath(journalDir, name);
  }


  public void put_(X x, FObject obj) {

  }

  public void remove(X x, FObject obj) {

  }

  private void doWrite(X x, FObject obj) {
    synchronized ( fileLock ) {

    }
  }


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

      synchronized ( fileLock ) {
        position = inChannel.size();
      }

      // Allocate 500M.
      // TODO: make sure memory assign to this instance is bigger enough.
      // ByteBuffer byteBuffer = ByteBuffer.allocate(524288000);
      ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
      ByteBuffer lengthBuffer = ByteBuffer.allocate(8);
      long length = -1;
      //TODO: send ack to MM. 

      while ( inChannel.position() < position ) {
        length = inChannel.read(byteBuffer);
        lengthBuffer = lengthBuffer.putLong(length);

        byteBuffer.flip();
        lengthBuffer.flip();

        while ( lengthBuffer.hasRemaining() ) { socketChannel.write(lengthBuffer); }
        while ( byteBuffer.hasRemaining() ) { socketChannel.write(byteBuffer); }

        lengthBuffer.clear();
        byteBuffer.clear();
      }

    } catch ( IOException e ) {
      try {
        socketChannel.close();
        key.cancel();
      } catch ( IOException ie ) {
        //TODO: log error.
      }
    }
    //TODO: send finish ack
    //TODO: activate sink;
  }
}
