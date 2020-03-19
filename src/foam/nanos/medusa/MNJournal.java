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
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;

//TODO: is it a good ideal to keep a very big file?
//TODO: use new file to replace block.
public class MNJournal extends FileJournal {

  private static FileSystem fileSystem = FileSystems.getDefault();

  private String journalDir;
  private String filename;
  private FileChannel outChannel;
  private Object fileLock = new Object();
  private long lateIndex;
  private DAO entryRecordDAO;
  private volatile boolean isReady;
  private boolean isHash = true;
  // To avoid we need to create ByteBuffer everyTime when we write.
  // Allocate 20KB.
  private ByteBuffer writeBuffer = ByteBuffer.allocate(40 * 1024);
  private long maxGlobalIndex = Long.MIN_VALUE;
  private long minGlobalIndex = Long.MAX_VALUE;
  private Logger logger;
  private MNJournal(X x, String filename) {
    setX(x);
    logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName() },
      (Logger) x.get("logger"));
    entryRecordDAO = (DAO) x.get("entryRecordDAO");
    if ( entryRecordDAO == null ) throw new RuntimeException("entryRecordDAO miss");
    this.filename = filename;
    this.journalDir = System.getProperty("JOURNAL_HOME");
    this.outChannel = null;
    try {
      this.outChannel = FileChannel.open(getPath(filename), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    } catch ( IOException e) {
      logger.error(e);
      throw new RuntimeException(e);
    } finally {
      try {
        if ( this.outChannel != null ) {
          this.outChannel.close();
          this.outChannel = null;
        }
      } catch ( IOException ioe ) {
        throw new RuntimeException(ioe);
      }
    }
    //blocking();
    //load min and max index;
    ArraySink sink = (ArraySink) entryRecordDAO
                                    .where(EQ(EntryRecord.FILE_NAME, filename))
                                    .select(new ArraySink());
    List list = sink.getArray();
    for ( Object obj : list ) {
      EntryRecord entryRecord = (EntryRecord) obj;
      if ( entryRecord.getMaxIndex() > maxGlobalIndex ) {
        maxGlobalIndex = entryRecord.getMaxIndex();
      }
      if ( entryRecord.getMinIndex() < minGlobalIndex ) {
        minGlobalIndex = entryRecord.getMinIndex();
      }
    }
  }

  public long getCurrentMaxIndex() {
    return maxGlobalIndex;
  }

  private Path getPath(String name) {
    return SafetyUtil.isEmpty(journalDir) ? fileSystem.getPath(name) : fileSystem.getPath(journalDir, name);
  }


  public boolean isReady() {
    return isReady;
  }

  @Override
  public FObject put(X x, String prefix, DAO dao, FObject obj) {
    logger.debug("put", "prefix:", prefix, obj);
    MedusaEntry entry = (MedusaEntry) obj;
    entry.setAction("p");
    String hash1 = entry.getHash1();
    String hash2 = entry.getHash2();
    //TODO: Do not hard code SHA-256,
    //TODO: use hashingJDAO.
    if ( isHash ) {
      try {
        //global hash.
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(hash1.getBytes(StandardCharsets.UTF_8));
        md.update(hash2.getBytes(StandardCharsets.UTF_8));
        String myHash = byte2Hex(entry.getNu().hash(md));
        entry.setMyHash(myHash);

        //internal hash.
        md = MessageDigest.getInstance("SHA-256");
        String internalHash = byte2Hex(entry.hash(md));
        entry.setInternalHash(internalHash);
      } catch ( Exception e ) {
        logger.error(e);
        throw new RuntimeException(e);
      }
    }
    String msg = new Outputter(x).stringify(obj);
    doWrite(x, msg + "\n", entry.getMyIndex());
    return obj;
  }

  @Override
  public FObject remove(X x, String prefix, DAO dao, FObject obj) {
    logger.debug("remove", "prefix:", prefix, obj);
    MedusaEntry entry = (MedusaEntry) obj;
    entry.setAction("r");
    String hash1 = entry.getHash1();
    String hash2 = entry.getHash2();
    //TODO: Do not hard code SHA-256,
    //TODO: use hashingJDAO.
    if ( isHash ) {
      try {
        //global hash.
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(hash1.getBytes(StandardCharsets.UTF_8));
        md.update(hash2.getBytes(StandardCharsets.UTF_8));
        String myHash = byte2Hex(entry.getNu().hash(md));
        entry.setMyHash(myHash);

        //internal hash.
        md = MessageDigest.getInstance("SHA-256");
        String internalHash = byte2Hex(entry.hash(md));
        entry.setInternalHash(internalHash);
      } catch ( Exception e ) {
        logger.error(e);
        throw new RuntimeException(e);
      }
    }
    doWrite(x, new Outputter(x).stringify(obj) + "\n", entry.getMyIndex());
    return obj;
  }

  private volatile int blockIndex = 0;
  private void doWrite(X x, String record, long globalIndex) {
    try {
      synchronized ( fileLock ) {
        // TODO: why opening on each write operation?
        this.outChannel = FileChannel.open(getPath(filename), StandardOpenOption.APPEND);
        if ( globalIndex > maxGlobalIndex ) {
          maxGlobalIndex = globalIndex;
        }
        if ( globalIndex < minGlobalIndex ) {
          minGlobalIndex = globalIndex;
        }

        writeBuffer.clear();
        //TODO: remove it latter.
        byte[] bytes = record.getBytes(Charset.forName("UTF-8"));
        writeBuffer.put(bytes);
        writeBuffer.flip();
        while ( writeBuffer.hasRemaining() ) {
          outChannel.write(writeBuffer);
        }
      }
    } catch ( IOException ioe ) {
      throw new RuntimeException(ioe);
    } finally {
      try {
        if ( this.outChannel != null ) {
          this.outChannel.close();
          this.outChannel = null;
        }
      } catch ( IOException ioe ) {
        throw new RuntimeException(ioe);
      }
    }
  }

  private static Map<String, MNJournal> journalMap = new HashMap<String, MNJournal>();

  public synchronized static MNJournal getMNjournal(X x, String serviceName) {
    if ( journalMap.get(serviceName) != null ) return journalMap.get(serviceName);
    journalMap.put(serviceName, new MNJournal(x, serviceName));
    return journalMap.get(serviceName);
  }

  private boolean blocking() {
    try {
      ArraySink sink = (ArraySink) entryRecordDAO
                                    .where(EQ(EntryRecord.FILE_NAME, filename))
                                    .orderBy(new Desc(EntryRecord.ID))
                                    .select(new ArraySink());
      List list = sink.getArray();

      FileChannel inChannel = FileChannel.open(getPath(filename), StandardOpenOption.CREATE, StandardOpenOption.READ);
      long fileSize = inChannel.size();
      long offset = -1;
      int bufferSize;
      if ( list.size() == 0 ) {
        // Load from 0 to file size.
        bufferSize = (int) (fileSize - 0L);
        offset = 0L;
      } else {
        EntryRecord lastRecord = (EntryRecord) list.get(0);
        offset = (lastRecord.getOffset() + (long) lastRecord.getLength());
        bufferSize = (int) (fileSize - (offset));
      }
      ByteBuffer byteBuffer = ByteBuffer.allocate(bufferSize);
      inChannel.position(offset);
      inChannel.read(byteBuffer);
      byteBuffer.flip();
      BufferedReader reader = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(byteBuffer.array())));

      String line;
      int count = 0;
      long minIndex = Long.MAX_VALUE;
      long maxIndex = Long.MIN_VALUE;

      while ( ( line = reader.readLine() ) != null ) {
        if ( "".equals(line.trim()) ) continue;
        MedusaEntry entry = (MedusaEntry) getX().create(JSONParser.class).parseString(line);
        if ( entry.getMyIndex() < minIndex ) minIndex = entry.getMyIndex();
        if ( entry.getMyIndex() > maxIndex ) maxIndex = entry.getMyIndex();
        count++;
      }
      if ( count > 0 ) {
        EntryRecord newRecord = new EntryRecord();
        newRecord.setFileName(filename);
        newRecord.setOffset(offset);
        newRecord.setLength(bufferSize);
        newRecord.setTotalEntry(count);
        newRecord.setMaxIndex(maxIndex);
        newRecord.setMinIndex(minIndex);
        entryRecordDAO.put(newRecord);
      }
      return true;
    } catch ( Exception e ) {
      //TODO: report error.
      logger.error(e);
      return false;
    }

  }

  public void loadBlock(X x, long id) {

    SelectionKey key = (SelectionKey) x.get("selectionKey");
    SocketChannel socketChannel = (SocketChannel) key.channel();

    if ( key == null ) throw new RuntimeException("SelectionKey do not find.");
    if ( socketChannel == null ) throw new RuntimeException("SocketChannel do not find");

    try {
      EntryRecord record = (EntryRecord) entryRecordDAO.find_(x, id);
      FileChannel inChannel = FileChannel.open(getPath(filename), StandardOpenOption.CREATE, StandardOpenOption.READ);
      long offset = record.getOffset();
      int length = record.getLength();

      ByteBuffer byteBuffer = ByteBuffer.allocate(length);
      inChannel.position(offset);
      inChannel.read(byteBuffer);
      byteBuffer.flip();
      BufferedReader reader = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(byteBuffer.array())));

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
          //TODO: hash check.
          Outputter outputter = new Outputter(x);
          String entryString = outputter.stringify(entry);
          //TODO: find a better way to implement this.
          byte[] bytes = entryString.getBytes(Charset.forName("UTF-8"));
          totalSendingSize = totalSendingSize + 4 + bytes.length;
          entries.add(entryString);
          count++;
        } catch ( Exception ioe ) {
          logger.error(ioe);
          //TODO: terminal reply, and send error message to mediator, and
          //stop this mmJournal until problem fix.
          BlockInfo blockInfo = new BlockInfo();
          blockInfo.setFileName(filename);
          blockInfo.setAnyFailure(true);
          blockInfo.setFailLine(line);
          blockInfo.setFailReason(ioe.toString());
          blockInfo.setEof(true);
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
            //TODO: log
            logger.error(ie);
          }
          return;
        }
      }

      BlockInfo blockInfo = new BlockInfo();
      blockInfo.setIsSort(false);
      blockInfo.setFileName(filename);
      blockInfo.setEof(true);
      blockInfo.setMaxIndex(record.getMaxIndex());
      blockInfo.setMinIndex(record.getMinIndex());
      blockInfo.setAnyFailure(false);
      blockInfo.setTotalEntries(count);
      Outputter outputter = new Outputter(x);
      String blockInfoStr = outputter.stringify(blockInfo);
      byte[] blockInfoBytes = blockInfoStr.getBytes(Charset.forName("UTF-8"));
      ByteBuffer sendBuffer = ByteBuffer.allocate(4 + blockInfoBytes.length + 4 + totalSendingSize);

      sendBuffer.putInt(blockInfoBytes.length);
      sendBuffer.put(blockInfoBytes);
      sendBuffer.putInt(blockInfoBytes.length);
      for ( String entry : entries ) {
        byte[] bytes = entry.getBytes(Charset.forName("UTF-8"));
        sendBuffer.putInt(bytes.length);
        sendBuffer.put(bytes);
      }
      sendBuffer.flip();

      while ( sendBuffer.hasRemaining() ) { socketChannel.write(sendBuffer); }

    } catch ( IOException ioe ) {
      logger.error(ioe);
        //TODO: send error to mediator. Mediator should fail this node.
        //Terminator replay.
        try {
          socketChannel.close();
          key.cancel();
        } catch ( IOException ie ) {
          //TODO: log
          logger.error(ie);
        }
        return;
      }
  }

  // Mediator should subscribe dao first before apply this method.
  public void replayFrom(X x, DAO dao, long indexFrom) {
    SelectionKey key = (SelectionKey) x.get("selectionKey");
    SocketChannel socketChannel = (SocketChannel) key.channel();

    if ( key == null ) throw new RuntimeException("SelectionKey do not find.");
    if ( socketChannel == null ) throw new RuntimeException("SocketChannel do not find");
    FileChannel inChannel = null;
    try {
      long fileSize = -1;
      inChannel = FileChannel.open(getPath(filename), StandardOpenOption.CREATE, StandardOpenOption.READ);

      // We can synchronize whole below code using fileLock,
      // but it is inefficient.
      // We can just sync and get file size. and build sink attach to the DAO.
      // This way we can do replay and write in parallel.
      ArraySink sink;
      synchronized ( fileLock ) {
        //All entry record.
        sink = (ArraySink) entryRecordDAO
          .where(EQ(EntryRecord.FILE_NAME, filename))
          .orderBy(EntryRecord.ID)
          .select(new ArraySink());
        fileSize = inChannel.size();
        logger.info("readfileSize: " + fileSize);

      List list = sink.getArray();
      EntryRecord lastRecord = null;
      // Journal will be send block by block to mediator.
      try {
        for ( Object obj : list ) {
          EntryRecord record = (EntryRecord) obj;
          lastRecord = record;
          if ( record.getMinIndex() < indexFrom && record.getMaxIndex() < indexFrom ) {
            inChannel.position((long)(record.getOffset() + (long)record.getLength()));
            continue;
          }
          int bufferSize = record.getLength();
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
              //TODO: hash check.
              Outputter outputter = new Outputter(x);
              String entryString = outputter.stringify(entry);
              //TODO: find a better way to implement this.
              byte[] bytes = entryString.getBytes(Charset.forName("UTF-8"));
              totalSendingSize = totalSendingSize + 4 + bytes.length;
              entries.add(entryString);
              count++;
            } catch ( Exception ioe ) {
              logger.error(ioe);
              //TODO: terminal reply, and send error message to mediator, and
              //stop this mmJournal until problem fix.
              BlockInfo blockInfo = new BlockInfo();
              blockInfo.setFileName(filename);
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
                logger.error(ie);
              }
              return;
            }
          }

          // Start to send block to mediator.
          BlockInfo blockInfo = new BlockInfo();
          blockInfo.setIsSort(false);
          blockInfo.setFileName(filename);
          blockInfo.setEof(false);
          blockInfo.setMaxIndex(record.getMaxIndex());
          blockInfo.setMinIndex(record.getMinIndex());
          blockInfo.setOffset(record.getOffset());
          blockInfo.setAnyFailure(false);
          blockInfo.setTotalEntries(count);
          Outputter outputter = new Outputter(x);
          String blockInfoStr = outputter.stringify(blockInfo);
          byte[] blockInfoBytes = blockInfoStr.getBytes(Charset.forName("UTF-8"));
          ByteBuffer sendBuffer = ByteBuffer.allocate(4 + blockInfoBytes.length + 4 + totalSendingSize);

          // sendBuffer.putInt(totalSendingSize);
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
        int bufferSize;
        if ( lastRecord == null ) {
          bufferSize = (int) (fileSize - 0L);
        } else {
          bufferSize = (int) (fileSize - (lastRecord.getOffset() + (long) lastRecord.getLength()));
          logger.debug(bufferSize);
        }

        ByteBuffer byteBuffer = ByteBuffer.allocate(bufferSize);
        inChannel.read(byteBuffer);
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
            if ( entry == null ) throw new RuntimeException("parse error: " + line);
            if ( entry.getMyIndex() < indexFrom ) continue;
            if ( entry.getMyIndex() < minIndex ) minIndex = entry.getMyIndex();
            if ( entry.getMyIndex() > maxIndex ) maxIndex = entry.getMyIndex();
            //TODO: Use HashingJDAO to replay following code + 
            //Support rollingHash for internal.
            //only verify internalHash.
            if ( isHash ) {
              try {
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                String internalHash = MNJournal.byte2Hex(entry.hash(md));
                if ( ! internalHash.equals(entry.getInternalHash()) ) {
                  //logger.info("Internal Hash verify FAIL: [ \n" + "expect Hash value: " + myHash + "\n" + "caculate Hash value: " + entry.getMyHash() + "\n]");
                  throw new RuntimeException("internal hash fail -> line: " + line);
                }
              } catch ( Exception e ) {
                logger.error(e);
                throw new RuntimeException(e);
              }
            }

            Outputter outputter = new Outputter(x);
            String entryString = outputter.stringify(entry);
            //TODO: find a better way to implement this.
            byte[] bytes = entryString.getBytes(Charset.forName("UTF-8"));
            totalSendingSize = totalSendingSize + 4 + bytes.length;
            entries.add(entryString);
            count++;
          } catch ( Exception ioe ) {
            logger.error(ioe);
            //TODO: terminal reply, and send error message to mediator, and
            //stop this mmJournal until problem fix.
            BlockInfo blockInfo = new BlockInfo();
            blockInfo.setFileName(filename);
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
              logger.warning(ioe);
              socketChannel.close();
              key.cancel();
            } catch ( IOException ie ) {
              logger.info(ie.toString());
            }
            return;

          }
        }

        // Send last block to mediator.
        BlockInfo blockInfo = new BlockInfo();
        blockInfo.setIsSort(false);
        blockInfo.setFileName(filename);
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
        logger.info(ioe);
        try {
          socketChannel.close();
          key.cancel();
        } catch ( IOException ie ) {
          logger.info(ie);
        }
        return;
      }
      }

    } catch ( IOException e ) {
      logger.info(e);
      try {
        socketChannel.close();
        key.cancel();
      } catch ( IOException ie ) {
        logger.info(ie);
      }
    } finally {
      try {
        if ( inChannel != null ) {
          inChannel.close();
          inChannel = null;
        }
        socketChannel.close();
        key.cancel();
      } catch ( IOException ie ) {
        logger.info(ie);
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
