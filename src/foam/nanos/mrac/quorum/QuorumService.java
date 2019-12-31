/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.mrac.quorum;

import foam.nanos.NanoService;
import foam.nanos.mrac.*;
import foam.core.AbstractFObject;
import foam.core.X;
import foam.dao.DAO;
import foam.core.FoamThread;

import java.io.IOException;

// Initial QuorumNetworkManager and Election.
// Start voting.
public class QuorumService extends AbstractFObject implements NanoService {

  protected Long clusterId = Long.parseLong(System.getProperty("CLUSTER"));
  private ClusterNode mySelf;
  private QuorumNetworkManager networkManager;
  private Election election;
  // Initial myState.
  public volatile InstanceState myState = InstanceState.ELECTING;
  public volatile Vote primaryVote;
  private RunElection runElection;
  DAO clusterDAO;

  public QuorumService(X x) {
    System.out.println("QuorumServer");
    setX(x);
    if ( x == null ) throw new RuntimeException("Context no found.");
    clusterDAO = (DAO) x.get("clusterNodeDAO");
    if ( clusterDAO == null ) throw new RuntimeException("clusterNodeDAO no found.");

    mySelf = (ClusterNode) clusterDAO.find(clusterId);
    if ( mySelf == null ) throw new RuntimeException("ClusterNode no found: " + clusterId);

    networkManager = new QuorumNetworkManager(x);
    election = new Election(x, networkManager, this);
    runElection = new RunElection();
  }



  public boolean electing() {
    return false;
  }

  public void start() throws Exception {
    initialElection();
    runElection.start();
  }

  public synchronized void setMyState(InstanceState state) {
    this.myState = state;
  }

  public synchronized InstanceState getMyState() {
    return myState;
  }

  public synchronized Vote getPrimaryVote() {
    return primaryVote;
  }

  public synchronized void setPrimaryVote(Vote vote) {
    this.primaryVote = vote;
  }

  public synchronized void initialElection() {
    //Set initial value for Vote.
    if ( getMyState() == InstanceState.ELECTING ) {
      // Initially propose mySelf as Primary.
      Vote vote = new Vote();
      vote.setPrimaryInstanceId(mySelf.getId());
      vote.setCriteria(mySelf.getId());
      setPrimaryVote(vote);
    }
  }


  public synchronized void reset() {
    isReset = true;
  }

  private volatile boolean isReset = false;
  public volatile InstanceState exposeState = InstanceState.ELECTING;

  class RunElection extends FoamThread {
    volatile boolean isRunning = true;

    RunElection() {
      super("QuorumService.RunElection");
    }

    @Override
    public void run() {
      while ( isRunning ) {
        if ( getMyState() == InstanceState.ELECTING ) {
          try {
            System.out.println("ELECTING");
            setPrimaryVote(election.electingPrimary());
            System.out.println(">>>>>>>>>>>>>>>");
            System.out.println("!!!!!!!!!!!!!end election");
            System.out.println("*********Primary: " + getPrimaryVote().getPrimaryInstanceId());
          } catch ( Exception e ) {
            setMyState(InstanceState.ELECTING);
          }
        } else if ( getMyState() == InstanceState.PRIMARY ) {
          System.out.println("Primary");
          try {
            //TODO: adjust MMjournal.
            exposeState = InstanceState.PRIMARY;
            while ( true ) {
              //once become primary. It will stay primary forever.
            }
          } catch ( Exception e ) {
            System.out.println(e);
          } finally {
            exposeState = InstanceState.ELECTING;
            setMyState(InstanceState.ELECTING);
          }
        } else if ( getMyState() == InstanceState.SECONDARY ) {
          System.out.println("Secondary");
          try {
            ClusterNode primaryNode = (ClusterNode) clusterDAO.find(getPrimaryVote().getPrimaryInstanceId());
            if ( primaryNode == null ) throw new RuntimeException("Can not find primary node");
            String urlString = "http://" + primaryNode.getIp() + ":" + primaryNode.getServicePort() + "/service" + "/ping";
            exposeState = InstanceState.SECONDARY;
            while ( true ) {
              try {
                Thread.sleep(200);
              } catch ( InterruptedException e ) {
                System.out.println(e);
              }
              // Heartbeat.
              ping(urlString,"");
            }
          } catch ( Exception e ) {
            e.printStackTrace();
          } finally {
            exposeState = InstanceState.ELECTING;
            setMyState(InstanceState.ELECTING);
          }
        } else {
          System.out.println("Wrong state");
          setMyState(InstanceState.ELECTING);
          exposeState = InstanceState.ELECTING;
        }
      }
      System.out.println("end of election service");

    }

    public void close() {
      isRunning = false;
    }
  }

  public static String ping(String urlString, String msg) throws IOException {

    java.net.HttpURLConnection conn;

    java.net.URL url = new java.net.URL(urlString);
    conn = (java.net.HttpURLConnection)url.openConnection();
    conn.setDoOutput(true);
    conn.setRequestMethod("POST");
    conn.setRequestProperty("Accept", "application/json");
    conn.setRequestProperty("Content-Type", "application/json");

    java.io.OutputStreamWriter output = new java.io.OutputStreamWriter(conn.getOutputStream(),
        java.nio.charset.StandardCharsets.UTF_8);

    output.write(msg);

    output.close();

    byte[] buf = new byte[8388608];
    java.io.InputStream input = conn.getInputStream();

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

    String str = new String(buf, 0, off, java.nio.charset.StandardCharsets.UTF_8);
    return str;
  }
}
