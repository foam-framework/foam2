/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.LinkedList;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

import foam.core.X;
import foam.core.FObject;
import foam.core.FoamThread;
import foam.core.AbstractFObject;
import foam.dao.DAO;
import foam.dao.Journal;
import foam.dao.AbstractJournal;
import static foam.mlang.MLang.*;
import foam.dao.Sink;
import foam.dao.ArraySink;
import foam.dao.AbstractSink;
import foam.mlang.sink.GroupBy;
import foam.core.Identifiable;
import foam.box.Message;
import foam.box.RPCMessage;
import foam.lib.json.Outputter;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

import java.net.URL;
import java.net.HttpURLConnection;
import java.nio.charset.StandardCharsets;
import java.io.OutputStreamWriter;
import java.io.InputStream;
import java.io.IOException;

import org.apache.commons.io.IOUtils;
import javax.servlet.http.HttpServletResponse;
import foam.lib.json.JSONParser;

import foam.box.RPCMessage;
import foam.box.HTTPReplyBox;
import foam.box.Message;
import foam.box.RPCReturnMessage;

import java.nio.channels.SocketChannel;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.ByteBuffer;
import java.net.InetSocketAddress;
import java.nio.charset.Charset;

// Make sure that this class sould only have one instance in single journal mode.
// In multiple journal mode. each JDAO will have it's own instance.
// can simple get put to MedusaMediator
// Make sure MM initial before initial of this class.
// TODO: refactor this class as DAO.
// TODO: refactor all clusterNode finding in the a DAO. provide better controller of MN.
public class MMJournal extends AbstractJournal {

  private String serviceName;

  private final Map<Long, ArrayList<ClusterNode>> groupToMN = new HashMap<Long, ArrayList<ClusterNode>>();
  private final List<ArrayList<ClusterNode>> groups  = new LinkedList<ArrayList<ClusterNode>>();
  private final List<ClusterNode> availableNodes = new LinkedList<ClusterNode>();
  // Default TIME_OUT is 5 second
  private final long TIME_OUT = 10000;

  // globalIndex should be unique in each filename.
  // One MMJournal instance can be shared by different DAO(Single Journal Mode).
  // Method: Replay will update this index.
  private AtomicLong globalIndex = new AtomicLong(1);

  //Only record two entry for now.
  //TODO: need to initial parents.
  MedusaEntry parent1;
  MedusaEntry parent2;
  int hashIndex = 1;
  Object hashRecordLock = new Object();

  //TODO: check if this method is really threadsafe.
  private void updateHash(MedusaEntry parent) {
    synchronized ( hashRecordLock ) {
      if ( hashIndex == 1 ) {
        parent1 = parent;
        hashIndex = 2;
      } else {
        parent2 = parent;
        hashIndex =1;
      }
    }
  }

  private MMJournal(String serviceName) {
    this.serviceName = serviceName;
  }

  Object initialLock = new Object();
  private void initial(X x) {
    synchronized ( initialLock ) {
      if ( isInitialized ) return;

      if ( x == null ) throw new RuntimeException("Context miss.");
      DAO clusterNodeDAO = (DAO) x.get("clusterNodeDAO");
      if ( clusterNodeDAO == null ) throw new RuntimeException("clusterNodeDAO miss");

      GroupBy groupToInstance = (GroupBy) clusterNodeDAO
        .where(EQ(ClusterNode.TYPE, ClusterNodeType.MN))
        .select(GROUP_BY(ClusterNode.GROUP, new ArraySink.Builder(getX()).build()));

      for ( Object key : groupToInstance.getGroups().keySet() ) {
        for ( Object value: ((ArraySink) groupToInstance.getGroups().get(key)).getArray() ) {
          ClusterNode clusterNode = (ClusterNode) value;
          if ( groupToMN.get(clusterNode.getGroup()) == null ) {
            groupToMN.put(clusterNode.getGroup(), new ArrayList<ClusterNode>());
          }
          System.out.println(clusterNode);
          groupToMN.get(clusterNode.getGroup()).add(clusterNode);
          availableNodes.add(clusterNode);
        }
      }

      for ( Long group : groupToMN.keySet() ) {
        groups.add(groupToMN.get(group));
      }

      //TODO: remove below code. it only use for test.
      parent1 = new MedusaEntry();
      parent1.setMyIndex(1);
      parent1.setMyHash("aa");
      parent2 = new MedusaEntry();
      parent2.setMyIndex(2);
      parent2.setMyHash("bb");

      isInitialized = true;
    }
  }


  private ArrayList removeMN(long group) {
    return groupToMN.remove(group);
  }

  // GlobalIndex should only set in replay.
  public void setGlobalIndex(Long index) {
    globalIndex.set(index);
  }

  //TODO: provide better to do this.
  Object lock = new Object();
  int robin = 0 ;
  public int nextRobin() {
    synchronized ( lock ) {
      if ( robin == 1000000 ) return ( robin = 0 );
      else return robin++;
    }
  }

  // The method is thread-safe.
  public Long getGlobalIndex() {
    return globalIndex.getAndIncrement();
  }


  private static Map<String, MMJournal> journalMap = new HashMap<String, MMJournal>();

  public synchronized static MMJournal getMMjournal(String serviceName) {
    if ( journalMap.get(serviceName) != null ) return journalMap.get(serviceName);
    journalMap.put(serviceName, new MMJournal(serviceName));
    return journalMap.get(serviceName);
  }

  public volatile boolean isVersion = true;
  private volatile boolean isInitialized = false;
  // We will remove synchronized key word in the DAO put.
  // This method has to be thread safe.
  // The method only work if FObject implement Identifiable.Identifiable
  // Version is used to allow we can make parallel call.
  // TODO: can we do this versioning code at the begnning of DAO?
  public void put_(X x, FObject old, FObject nu) {
    if ( ! isInitialized ) initial(x);
    System.out.println("putput_");
    long myIndex = getGlobalIndex();

    // Get whole entry first to make sure threadsafe.
    MedusaEntry p1 = parent1;
    MedusaEntry p2 = parent2;
    Message msg =
      createMessage(
        p1.getMyIndex(),
        p1.getMyHash(),
        p2.getMyIndex(),
        p2.getMyHash(),
        myIndex,
        "put_",
        "p",
        old,
        nu
      );
    Outputter outputter = new Outputter(getX());

    String mn = outputter.stringify(msg);
    System.out.println(mn);

    int index = nextRobin() % groups.size();
    int i = 0;
    int totalTry = groups.size();
    boolean isPersist = false;
    System.out.println("totalTry");
    System.out.println(totalTry);

    while ( i < totalTry ) {
      System.out.println("try");
      ArrayList<ClusterNode> nodes = groups.get(index / totalTry);
      Object[] tasks = new Object[nodes.size()];
      System.out.println(nodes.size());

      for ( int j = 0 ; j < nodes.size() ; j++ ) {
        ClusterNode node = nodes.get(j);
        tasks[j] = new FutureTask<String>(new Sender(node.getIp(), node.getServicePort(), mn));
        //TODO: use threadpool.
        new Thread((FutureTask<String>) tasks[j]).start();
      }

      long endtime = System.currentTimeMillis() + TIME_OUT * (i + 1);
      int check = 0;
      boolean[] checks = new boolean[nodes.size()];
      Arrays.fill(checks, false);

      MedusaEntry p = null;
      int threhold = 1;

      while ( System.currentTimeMillis() < endtime && Math.abs(check) < threhold ) {
        for ( int j = 0 ; j < tasks.length ; j++ ) {
          if ( checks[j] == false && ((FutureTask<String>) tasks[j]).isDone() ) {
            FutureTask<String> task = (FutureTask<String>) tasks[j];
            try {
              String response = task.get();
              //TODO: a bug, return message format wrong.
              Message responseMessage = (Message) getX().create(JSONParser.class).parseString(response);
              System.out.println("response>>>>>>>>");
              System.out.println(response);
              p = (MedusaEntry) ((RPCReturnMessage) responseMessage.getObject()).getData();
              if ( p instanceof MedusaEntry ) {
                check++;
              } else {
                check--;
              }
            } catch ( Exception e ) {
              //TODO: log error
              System.out.println(e);
              check--;
            } finally {
              checks[j] = true;
            }
          }
        }
      }

      System.out.println(check);

      if ( check >= threhold ) {
        isPersist = true;
        updateHash(p);
        break;
      }

      index++;
      i++;
    }



    // Important
    if ( isPersist == false ) {
      //TODO: shutdown the put method.
      throw new RuntimeException("MN do not work....");
    }


  }

  private Message createMessage(
    long globalIndex1,
    String hash1,
    long globalIndex2,
    String hash2,
    long myIndex,
    String method,
    String action,
    FObject old,
    FObject nu
  ) {
    Message message = getX().create(Message.class);
    RPCMessage rpc = getX().create(foam.box.RPCMessage.class);
    //put or remove
    rpc.setName(method);
    MedusaEntry entry = getX().create(MedusaEntry.class);
    entry.setServiceName(serviceName);
    // p or r
    entry.setAction(action);
    entry.setGlobalIndex1(globalIndex1);
    entry.setHash1(hash1);
    entry.setGlobalIndex2(globalIndex2);
    entry.setHash2(hash2);
    entry.setMyIndex(myIndex);
    entry.setOld(old);
    entry.setNu(nu);
    Object[] args = {null, entry};
    rpc.setArgs(args);

    message.setObject(rpc);
    HTTPReplyBox replyBox = getX().create(HTTPReplyBox.class);
    message.getAttributes().put("replyBox", replyBox);
    return message;
  }


  private class Sender implements Callable<String> {
    private String ip;
    private String message;
    private int port;

    public Sender(String ip, int port, String message) {
      this.ip = ip;
      this.message = message;
      this.port = port;
    }

    public String call() throws Exception {
      HttpURLConnection conn = null;
      OutputStreamWriter output = null;
      InputStream input = null;

      try {
        System.out.println("aaaaccccc");
        URL url = new URL("Http", ip, port, "/service/" + serviceName);
        System.out.println(url);

        conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Accept", "application/json");
        conn.setRequestProperty("Content-Type", "application/json");

        output =
          new OutputStreamWriter(conn.getOutputStream(), StandardCharsets.UTF_8);

        output.write(message);
        output.close();

         // check response code
        int code = conn.getResponseCode();
        if ( code != HttpServletResponse.SC_OK ) {
          throw new RuntimeException("Http server return: " + code);
        }

        byte[] buf = new byte[8388608];
        input = conn.getInputStream();

        int off = 0;
        int len = buf.length;
        int read = -1;
        while ( len != 0 && ( read = input.read(buf, off, len) ) != -1 ) {
          off += read;
          len -= read;
        }

        if ( len == 0 && read != -1 ) {
          throw new RuntimeException("Message too large.");
        }

        return  new String(buf, 0, off, StandardCharsets.UTF_8);
      } catch ( Exception e ) {
        System.out.println(e);
        throw e;
      } finally {
        IOUtils.closeQuietly(output);
        IOUtils.closeQuietly(input);
        if ( conn != null ) {
          conn.disconnect();
        }
      }
    }
  }

  //TODO: provide versioning for the remove.
  public void remove(X x, FObject obj) {
    //TODO;
    // synchronized ( uniqueStringLock ) {

    // }
  }

  //TODO: capture IOException.
  //TODO: need to have a cache dao.
  //TODO: can only execute by one thread at any giving time.
  public void replay(X x, DAO dao) {
    //TODO: need a speciall dao.
    if ( ! isInitialized ) initial(x);
    int fileBufferSize = 1024;
    ByteBuffer lengthBuffer = ByteBuffer.allocate(4);
    // MedusaNode id to Bytebuffer.
    Map<Long, Map<Long, LinkedList<ByteBuffer>>> groupToJournal = new ConcurrentHashMap<Long, Map<Long, LinkedList<ByteBuffer>>>();
    try {
      //TODO: code below could be multi-thread.
      for ( Map.Entry<Long, ArrayList<ClusterNode>> entry: groupToMN.entrySet() ) {
        long groupId = entry.getKey();
        Map<Long, LinkedList<ByteBuffer>> nodeToBuffers = new HashMap<Long, LinkedList<ByteBuffer>>();
        groupToJournal.put(groupId, nodeToBuffers);

        for ( ClusterNode node : entry.getValue() ) {
          LinkedList<ByteBuffer> buffers = new LinkedList<ByteBuffer>();
          nodeToBuffers.put(node.getId(), buffers);

          SocketChannel channel = SocketChannel.open();
          channel.configureBlocking(true);
          InetSocketAddress address = new InetSocketAddress(node.getIp(), node.getSocketPort());
          //The system should wait for connection at here.
          boolean connectResult = channel.connect(address);

          if ( connectResult == false )
            throw new RuntimeException("Replay can not connect to: " + node.getId());

          // Send replay command to MN.
          TcpMessage replayInitialMessage = new TcpMessage();
          replayInitialMessage.setServiceKey("MNService");
          RPCMessage rpc = x.create(RPCMessage.class);
          rpc.setName("replayAll");
          Object[] args = { null, serviceName };
          rpc.setArgs(args);
          replayInitialMessage.setObject(rpc);

          Outputter outputter = new Outputter(x);
          String msg = outputter.stringify(replayInitialMessage);
          byte[] bytes = msg.getBytes(Charset.forName("UTF-8"));
          ByteBuffer ackBuffer = ByteBuffer.allocate(4 + bytes.length);
          ackBuffer.putInt(bytes.length);
          ackBuffer.put(bytes);
          ackBuffer.flip();
          channel.write(ackBuffer);
          // Waiting for ACK from MN.
          lengthBuffer.clear();

          if ( channel.read(lengthBuffer) < 0 ) throw new RuntimeException("End of Stream");
          lengthBuffer.flip();

          int ackLength = lengthBuffer.getInt();
          if ( ackLength < 0 ) throw new RuntimeException("End of Stream");
          ByteBuffer packet = ByteBuffer.allocate(ackLength);
          if ( channel.read(packet) < 0 ) throw new RuntimeException("End of Stream");

          packet.flip();
          String ackString = new String(packet.array(), 0, ackLength, Charset.forName("UTF-8"));
          FilePacket filePacket = (FilePacket) x.create(JSONParser.class).parseString(ackString);
          int totalBlock = filePacket.getTotalBlock();

          for ( int i = 0 ; i < totalBlock ; i++ ) {
            lengthBuffer.clear();

            channel.read(lengthBuffer);
            lengthBuffer.flip();
            int length = lengthBuffer.getInt();
            ByteBuffer readBuffer = ByteBuffer.allocate(length);

            channel.read(readBuffer);
            readBuffer.flip();
            buffers.add(readBuffer);
          }
          //TODO: get entry from readBuffer and but into dao.
          //TODO: After replay If not primary add socket channel into a selector. and set blocking == false.
        }
      }
      System.out.println(">>>>>replay journal");
      printAll(x, groupToJournal);
      System.out.println("------replay journal end");
   } catch ( IOException ioe ) {
      //TODO: retry or stop system.
      throw new RuntimeException(ioe);
    }

  }

  // This method only use for test.
  // This method hold when the minimal ByteBuffer is greater than 4,
  // and a entry should not be accross more than two ByteBuffer.
  private final void printAll(X x, Map<Long, Map<Long, LinkedList<ByteBuffer>>> groupTojournal) {
    for ( Map.Entry<Long, Map<Long, LinkedList<ByteBuffer>>> entry1 : groupTojournal.entrySet() ) {
      long groupId = entry1.getKey();
      for ( Map.Entry<Long, LinkedList<ByteBuffer>> entry2: entry1.getValue().entrySet() ) {
        long clusterNodeId = entry2.getKey();
        byte[] carryOverBytes = null;
        int carryOverLength = -1;
        byte[] carryOverLengthBytes = null;
        byte[] lengthBytes = null;

        for ( ByteBuffer buffer : entry2.getValue() ) {

          if ( carryOverLengthBytes != null ) {
            int remain = 4 - carryOverLengthBytes.length;
            byte[] unreadLengthBytes = new byte[remain];
            buffer.get(unreadLengthBytes);
            lengthBytes = new byte[4];
            System.arraycopy(carryOverLengthBytes, 0, lengthBytes, 0, carryOverLengthBytes.length);
            System.arraycopy(unreadLengthBytes, 0, lengthBytes, carryOverLengthBytes.length, unreadLengthBytes.length);
            int length = ByteBuffer.wrap(lengthBytes).getInt();
          }

          if ( carryOverBytes != null ) {
            int remain = carryOverLength - carryOverBytes.length;
            byte[] remainBytes = new byte[remain];
            buffer.get(remainBytes);
            byte[] entryBytes = new byte[carryOverBytes.length + remainBytes.length];
            System.arraycopy(carryOverBytes, 0, entryBytes, 0, carryOverBytes.length);
            System.arraycopy(remainBytes, 0, entryBytes, carryOverBytes.length, remainBytes.length);
            String entry = new String(entryBytes, 0, carryOverLength, Charset.forName("UTF-8"));
            carryOverBytes = null;
            carryOverLength = -1;
            System.out.println(entry);
          }
          while ( buffer.hasRemaining() ) {
            int length;

            if ( lengthBytes != null ) {
              length = ByteBuffer.wrap(lengthBytes).getInt();
              lengthBytes = null;
            } else {
              length = buffer.getInt();
            }

            if ( buffer.remaining() < 4 ) {
              carryOverLengthBytes = new byte[buffer.remaining()];
              buffer.get(carryOverLengthBytes);
              carryOverBytes = null;
              carryOverLength = -1;
            } else if ( length > buffer.remaining() ) {
              carryOverBytes = new byte[buffer.remaining()];
              carryOverLength = length;
              buffer.get(carryOverBytes);
              carryOverLengthBytes = null;
            } else {
              byte[] bytes = new byte[length];
              buffer.get(bytes);
              String entry = new String(bytes, 0, length, Charset.forName("UTF-8"));
              System.out.println(entry);
              carryOverBytes = null;
              carryOverLength = -1;
              carryOverLengthBytes = null;
            }
          }
        }
      }
    }
  }
}
