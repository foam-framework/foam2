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

  // Default TIME_OUT is 5 second
  private final long TIME_OUT = 5000;

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
        "put",
        "p",
        old,
        nu
      );
    Outputter outputter = new Outputter(getX());

    String mn = outputter.stringify(msg);;

    int index = nextRobin() % groups.size();
    int i = 0;
    int totalTry = groups.size();
    boolean isPersist = false;

    while ( i < totalTry ) {
      ArrayList<ClusterNode> nodes = groups.get(index / totalTry);
      Object[] tasks = new Object[nodes.size()];

      for ( int j = 0 ; j < nodes.size() ; j++ ) {
        ClusterNode node = nodes.get(j);
        tasks[j] = new FutureTask<String>(new Sender(node.getIp(), mn));
        //TODO: use threadpool.
        new Thread((FutureTask<String>) tasks[j]);
      }

      long endtime = System.currentTimeMillis() + TIME_OUT * (i + 1);
      int check = 0;
      boolean[] checks = new boolean[nodes.size()];
      Arrays.fill(checks, false);

      MedusaEntry p = null;

      while ( System.currentTimeMillis() < endtime && check < 2 && check > -2 ) {
        for ( int j = 0 ; j < tasks.length ; j++ ) {
          if ( checks[j] == false && ((FutureTask<String>) tasks[j]).isDone() ) {
            FutureTask<String> task = (FutureTask<String>) tasks[j];
            try {
              String response = task.get();
              System.out.println(response);
              //TODO: a bug, return message format wrong.
              FObject responseMessage = getX().create(JSONParser.class).parseString(response);
              p = (MedusaEntry) responseMessage;
              if ( responseMessage instanceof MedusaMessage ) {
                check++;
              }
              check--;
            } catch ( Exception e ) {
              //TODO: log error
              check--;
            } finally {
              checks[j] = true;
            }
          }
        }
      }

      if ( check >= 2 ) {
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
    entry.setOld(old);
    entry.setNu(nu);
    Object[] args = {entry};
    rpc.setArgs(args);

    message.setObject(rpc);
    HTTPReplyBox replyBox = getX().create(HTTPReplyBox.class);
    message.getAttributes().put("replyBox", replyBox);
    return message;
  }


  private class Sender implements Callable<String> {
    private String ip;
    private String message;

    public Sender(String ip, String message) {
      this.ip = ip;
      this.message = message;
    }

    public String call() throws Exception {
      HttpURLConnection conn = null;
      OutputStreamWriter output = null;
      InputStream input = null;

      try {
        URL url = new URL("Http", ip, 8080, "service/" + serviceName);

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
          throw new RuntimeException("Http server did not return 200.");
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
    if ( ! ( obj instanceof Identifiable ) ) throw new RuntimeException("MM only accept Identifiable");

    Object id = ((Identifiable) obj).getPrimaryKey();
    if ( id == null ) throw new RuntimeException("Id should not be null");
    String className = obj.getClass().getName();
    String uniqueString = className + id.toString();
    String uniqueStringLock = String.valueOf(uniqueString).intern();

    synchronized ( uniqueStringLock ) {

    }
  }

  public void replay(X x, DAO dao) {
    //TODO: need a speciall dao.

  }
}
