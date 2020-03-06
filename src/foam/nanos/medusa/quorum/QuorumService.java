/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.medusa.quorum;

import foam.core.AbstractFObject;
import foam.core.FoamThread;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import static foam.mlang.MLang.*;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import foam.nanos.medusa.*;

import java.io.IOException;
import java.util.List;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.Map;

// Initial QuorumNetworkManager and Election.
// Start voting.
public class QuorumService extends AbstractFObject implements NanoService {

  protected String hostname = System.getProperty("hostname", "localhost");
  public ClusterNode mySelf;
  private QuorumNetworkManager networkManager;
  private Election election;
  // Initial myState.
  public volatile InstanceState myState = InstanceState.ELECTING;
  public volatile Vote primaryVote;
  private RunElection runElection;
  DAO clusterDAO;
  private volatile ClusterNode primaryClusterNode = null;

  LinkedBlockingQueue<Electable> primaryElectables;
  LinkedBlockingQueue<Electable> secondaryElectables;
  LinkedBlockingQueue<Electable> unReadyElectables;
  Logger logger;

  public  boolean isPrimary() {
    return getMyState() == InstanceState.PRIMARY;
  }

  public boolean electing() {
    return false;
  }

  public void start() throws Exception {
    X x = getX();
    logger = (Logger) getX().get("logger");
    if ( x == null ) throw new RuntimeException("Context no found.");
    clusterDAO = (DAO) x.get("clusterNodeDAO");
    if ( clusterDAO == null ) throw new RuntimeException("clusterNodeDAO no found.");

    ArraySink sink = (ArraySink) clusterDAO
                                  .where(EQ(ClusterNode.HOST_NAME, hostname))
                                  .select(new ArraySink());
    List list = sink.getArray();
    if ( list.size() != 1 ) throw new RuntimeException("error on clusterNode journal");
    mySelf = (ClusterNode) list.get(0);
    unReadyElectables = new LinkedBlockingQueue<Electable>();
    //mySelf = (ClusterNode) clusterDAO.find(clusterId);
    if ( mySelf == null ) throw new RuntimeException("ClusterNode no found: " + hostname);
    if ( mySelf.getGroup() != 1 || mySelf.getType() != MedusaType.MEDIATOR) {
      logger.info("not in group 1");
      return;
    }

    networkManager = new QuorumNetworkManager(x);
    election = new Election(x, networkManager, this);
    runElection = new RunElection();

    primaryElectables = new LinkedBlockingQueue<Electable>();
    secondaryElectables = new LinkedBlockingQueue<Electable>();

    initialElection();
    runElection.start();
  }

  public void registerElectable(Electable electable) {
    unReadyElectables.offer(electable);
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

  //TODO: apply this function.
  // This function only executes in one thread.
  // This instance has just become primary
  private void setPrimaryClusterNode(X x, long id, boolean amIprimary) {
    Logger logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName(),
        "setPrimaryClusterNode( " + id + ")"
      }, (Logger) x.get("logger"));

    logger.debug("enter");
    ClusterNode primaryNode = (ClusterNode) clusterDAO.find(id);
    if ( primaryNode == null ) throw new RuntimeException("Can not find ClusterNode with id: " + id);
    primaryClusterNode = primaryNode;
    logger.info("primaryNode: ", primaryNode);
    DAO configDAO = (DAO) x.get("localClusterConfigDAO");
    String primaryHostName = primaryNode.getIp();
    ClusterConfig config = (ClusterConfig) configDAO.find(primaryHostName);
    if ( config == null ) {
      logger.warning("cluster configuration not found for", primaryHostName);
      config = new ClusterConfig();
      config.setId(primaryHostName);
      config.setPort(primaryNode.getServicePort());
    } else {
      config = (ClusterConfig) config.fclone();
    }
    config.setNodeType(NodeType.PRIMARY);
    config.setSessionId(mySelf.getSessionId());
    config.setPort(primaryClusterNode.getServicePort());
    config = (ClusterConfig) configDAO.put(config);

    ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
    service.setConfig(config);
    service.setPrimaryConfig(config);
    service.setIsPrimary(amIprimary);
  }

  // This instance has just become a secondary
  private void setPrimaryClusterNode(ClusterNode clusterNode) {
    primaryClusterNode = clusterNode;
    X x = getX();
    Logger logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName(),
        "setPrimaryClusterNode(" + clusterNode + ")"
      }, (Logger) x.get("logger"));

    logger.debug("enter");

    DAO configDAO = (DAO) x.get("localClusterConfigDAO");
    ClusterConfig config = (ClusterConfig) configDAO.find(hostname);
    if ( config == null ) {
      logger.warning("cluster configuration not found for", hostname);
      config = new ClusterConfig();
      config.setId(hostname);
    } else {
      config = (ClusterConfig) config.fclone();
    }
    config.setNodeType(NodeType.SECONDARY);
    config.setSessionId(mySelf.getSessionId());
    config = (ClusterConfig) configDAO.put(config);

    ClusterConfig primaryConfig = (ClusterConfig) configDAO.find(clusterNode.getHostName());
    if ( primaryConfig == null ) {
      primaryConfig = new ClusterConfig();
      primaryConfig.setId(clusterNode.getHostName());
      primaryConfig.setPort(clusterNode.getServicePort());
    } else {
      primaryConfig = (ClusterConfig) primaryConfig.fclone();
    }
    primaryConfig.setNodeType(NodeType.PRIMARY);
    primaryConfig.setPort(primaryClusterNode.getServicePort());
    primaryConfig = (ClusterConfig) configDAO.put(primaryConfig);

    ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
    service.setConfig(config);
    service.setPrimaryConfig(primaryConfig);
    service.setIsPrimary(false);
  }

  private void resetPrimaryClusterNode() {
    ClusterConfigService service = (ClusterConfigService) getX().get("clusterConfigService");
    service.setIsPrimary(false);
  }

  public ClusterNode getPrimaryClusterNode() {
    return primaryClusterNode;
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
            setPrimaryVote(election.electingPrimary());
            logger.info("!!!!!!!!!!!!!end election");
            logger.info("*********Primary: " + getPrimaryVote().getPrimaryInstanceId());
          } catch ( Exception e ) {
            logger.error("ELECTNG: ",e);
            setMyState(InstanceState.ELECTING);
            resetPrimaryClusterNode();
          }
        } else if ( getMyState() == InstanceState.PRIMARY ) {
          logger.info("Primary");
          CountDownLatch countDownLatch = new CountDownLatch(1);
          QuorumInitial quorumInitial = null;
          try {

            exposeState = InstanceState.PRIMARY;
            setPrimaryClusterNode(getX(), getPrimaryVote().getPrimaryInstanceId(), true);
            quorumInitial = new QuorumInitial(countDownLatch);
            quorumInitial.start();
            //If you want to remove this while loop.
            //You need to comment out all code in the following finally block.
            while ( true ) {
              // Thread.sleep(500);
              //once become primary. It will stay primary forever.
            }
          } catch ( Exception e ) {
            logger.info("PRIMARY: ", e);
          } finally {
            exposeState = InstanceState.ELECTING;
            setMyState(InstanceState.ELECTING);
            if ( quorumInitial != null ) {
              quorumInitial.close();
              try {
                countDownLatch.await();
              } catch ( Exception e ) {
                logger.error(e);
              }
            }
            logger.info("leave primary");
          }
        } else if ( getMyState() == InstanceState.SECONDARY ) {
          logger.info("Secondary");
          CountDownLatch countDownLatch = new CountDownLatch(1);
          QuorumInitial quorumInitial = null;
          try {
            ClusterNode primaryNode = (ClusterNode) clusterDAO.find(getPrimaryVote().getPrimaryInstanceId());
            if ( primaryNode == null ) throw new RuntimeException("Can not find primary node");
            String urlString = "http://" + primaryNode.getIp() + ":" + primaryNode.getServicePort() + "/service" + "/ping";
            logger.info("ping primary: " + urlString);
            exposeState = InstanceState.SECONDARY;
            setPrimaryClusterNode(getX(), getPrimaryVote().getPrimaryInstanceId(), false);
            quorumInitial = new QuorumInitial(countDownLatch);
            quorumInitial.start();
            while ( true ) {
              try {
                Thread.sleep(1000);
              } catch ( InterruptedException e ) {
                logger.info("SECONDARY: ",e);
              }
              // Heartbeat.
              ping(urlString,"");
            }
          } catch ( Exception e ) {
            logger.error("SECONDARY: ", e);
          } finally {
            exposeState = InstanceState.ELECTING;
            resetPrimaryClusterNode();
            setMyState(InstanceState.ELECTING);
            if ( quorumInitial != null ) {
              quorumInitial.close();
              try {
                countDownLatch.await();
              } catch ( Exception e ) {
                logger.error(e);
              }
            }
            logger.info("leave Secondary");
          }
        } else {
          logger.info("Wrong state");
          setMyState(InstanceState.ELECTING);
          exposeState = InstanceState.ELECTING;
        }
      }
      logger.info("end of election service");

    }

    public void close() {
      isRunning = false;
    }
  }

  // This thread allow we seperator shutdown primary service as soon as
  // possible.
  public class QuorumInitial extends FoamThread {

    private CountDownLatch countDownLatch;
    private volatile boolean isRunning;

    public QuorumInitial(CountDownLatch countDownLatch) {
      super("quorumInitial");
      this.isRunning = true;
      this.countDownLatch = countDownLatch;
    }

    public void close() {
      this.isRunning = false;
    }
    @Override
    public void run() {
      try {
        while ( isRunning ) {
          Electable electable = null;
          try {
            electable = unReadyElectables.poll(200, TimeUnit.MILLISECONDS);
            if ( electable == null ) continue;
            if ( getMyState() == InstanceState.PRIMARY ) {
              electable.primary(getX());
              primaryElectables.put(electable);
            }
            if ( getMyState() == InstanceState.SECONDARY ) {
              electable.secondary(getX());
              secondaryElectables.put(electable);
            }
          } catch ( Exception e ) {
            //TODO: provide retry;
            logger.error("run:",e);
            if ( electable != null ) unReadyElectables.add(electable);
          }
        }
      } finally {
        Electable electable;
        while ( ( electable = primaryElectables.poll() ) != null ) {
          electable.leavePrimary();
          unReadyElectables.add(electable);
        }
        while ( ( electable = secondaryElectables.poll() ) != null ) {
          electable.leaveSecondary();
          unReadyElectables.add(electable);
        }
        countDownLatch.countDown();
      }
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
