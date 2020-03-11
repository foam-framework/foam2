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
import foam.nanos.http.PingService;
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
public class QuorumService
  extends AbstractFObject
          /*  implements NanoService*/
{

  protected String hostname_ = System.getProperty("hostname", "localhost");
  public ClusterConfig mySelf;
  private QuorumNetworkManager networkManager;
  private Election election;
  // Initial myState.
  public volatile InstanceState myState = InstanceState.ELECTING;
  public volatile Vote primaryVote;
  private RunElection runElection;
  DAO clusterDAO_;
  private volatile ClusterConfig primaryClusterConfig_ = null;

  LinkedBlockingQueue<Electable> primaryElectables;
  LinkedBlockingQueue<Electable> secondaryElectables;
  LinkedBlockingQueue<Electable> unReadyElectables = new LinkedBlockingQueue<Electable>();
  Logger logger_;

  public  boolean isPrimary() {
    return getMyState() == InstanceState.PRIMARY;
  }

  public boolean electing() {
    return false;
  }

  public void start() throws Exception {
    X x = getX();
    logger_ = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName() },
      (Logger) x.get("logger"));
    logger_.debug("starting");

    clusterDAO_ = (DAO) x.get("clusterConfigDAO");
    mySelf = (ClusterConfig) clusterDAO_.find(hostname_);
    if ( mySelf == null ) throw new RuntimeException("ClusterConfig not found: "+hostname_);
    if ( mySelf.getZone() != 0 ||
         mySelf.getType() != MedusaType.MEDIATOR) {
      logger_.debug(hostname_, "not in Zone 0 or not Mediator");
      return;
    }

    networkManager = new QuorumNetworkManager(x);
    election = new Election(x, networkManager, this);
    runElection = new RunElection();

    primaryElectables = new LinkedBlockingQueue<Electable>();
    secondaryElectables = new LinkedBlockingQueue<Electable>();

    initialElection();
    runElection.start();
    logger_.info("started");
 }

  public void registerElectable(Electable electable) {
    unReadyElectables.offer(electable);
  }

  public synchronized void setMyState(String primaryId, InstanceState state) {
    this.myState = state;
    if ( state == InstanceState.PRIMARY ||
         state == InstanceState.SECONDARY ) {
      this.setPrimaryClusterConfig(getX(), primaryId, state == InstanceState.PRIMARY);
    }
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
  private void setPrimaryClusterConfig(X x, String primaryId, boolean isPrimary) {
    logger_.debug("setPrimaryClusterConfig", primaryId, isPrimary);

    ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
    ClusterConfig primary;
    ClusterConfig config;
    if ( service.getIsPrimary() &&
         ! primaryId.equals(hostname_) ) {
      primary = (ClusterConfig) clusterDAO_.find(hostname_);
      if ( primary == null ) throw new RuntimeException("ClusterConfig not found: "+primaryId);
      primary = (ClusterConfig) primary.fclone();
      primary.setIsPrimary(false);
      primary = (ClusterConfig) clusterDAO_.put(primary);
      config = primary;

      service.setConfig(config);
      service.setPrimaryConfig(primary);
      service.setIsPrimary(isPrimary);
    } else if ( ! service.getIsPrimary() &&
                primaryId.equals(hostname_) ) {
      config = (ClusterConfig) clusterDAO_.find(primaryId);
      if ( config == null ) throw new RuntimeException("ClusterConfig not found: "+primaryId);
      config = (ClusterConfig) config.fclone();
      config.setIsPrimary(false);
      config = (ClusterConfig) clusterDAO_.put(config);

      primary = (ClusterConfig) clusterDAO_.find(hostname_);
      if ( primary == null ) throw new RuntimeException("ClusterConfig not found: "+hostname_);
      primary = (ClusterConfig) primary.fclone();
      primary.setIsPrimary(true);
      primary = (ClusterConfig) clusterDAO_.put(primary);

      service.setConfig(config);
      service.setPrimaryConfig(primary);
      service.setIsPrimary(isPrimary);
    }
  }

  private void resetPrimaryClusterConfig() {
    ClusterConfigService service = (ClusterConfigService) getX().get("clusterConfigService");
    if ( service.getIsPrimary() ) {
      ClusterConfig config = (ClusterConfig) clusterDAO_.find(hostname_);
      if ( config == null ) throw new RuntimeException("ClusterConfig not found: "+hostname_);
      config = (ClusterConfig) config.fclone();
      config.setIsPrimary(false);
      config = (ClusterConfig) clusterDAO_.put(config);

      service.setIsPrimary(false);
      service.setPrimaryConfig(null);
      service.setConfig(config);
    }
  }

  public ClusterConfig getPrimaryClusterConfig() {
    return primaryClusterConfig_;
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
      logger_.info("RunElection", "run", isRunning);
      while ( isRunning ) {
        logger_.info("RunElection", "state", getMyState().getLabel());
        if ( getMyState() == InstanceState.ELECTING ) {
          try {
            setPrimaryVote(election.electingPrimary());
            logger_.info("!!!!!!!!!!!!!end election");
            logger_.info("*********Primary:" + getPrimaryVote().getPrimaryInstanceId());
          } catch ( Exception e ) {
            logger_.error("ELECTING:", e);
            setMyState(hostname_, InstanceState.ELECTING);
            resetPrimaryClusterConfig();
          }
        } else if ( getMyState() == InstanceState.PRIMARY ) {
          logger_.info("Primary");
          CountDownLatch countDownLatch = new CountDownLatch(1);
          QuorumInitial quorumInitial = null;
          try {

            exposeState = InstanceState.PRIMARY;
            setPrimaryClusterConfig(getX(), getPrimaryVote().getPrimaryInstanceId(), true);
            quorumInitial = new QuorumInitial(countDownLatch);
            quorumInitial.start();
            //If you want to remove this while loop.
            //You need to comment out all code in the following finally block.
            while ( true ) {
              // TODO/REVIEW: this busywait should not be necessary - it's wasting a thread.
              Thread.sleep(1000L);
              //once become primary. It will stay primary forever.
            }
          } catch ( Exception e ) {
            logger_.info("PRIMARY: ", e);
          } finally {
            exposeState = InstanceState.ELECTING;
            setMyState(hostname_, InstanceState.ELECTING);
            if ( quorumInitial != null ) {
              quorumInitial.close();
              try {
                countDownLatch.await();
              } catch ( Exception e ) {
                logger_.error(e);
              }
            }
            logger_.info("leave primary");
          }
        } else if ( getMyState() == InstanceState.SECONDARY ) {
          logger_.info("Secondary");
          CountDownLatch countDownLatch = new CountDownLatch(1);
          QuorumInitial quorumInitial = null;
          try {
            ClusterConfig primaryNode = (ClusterConfig) clusterDAO_.find(getPrimaryVote().getPrimaryInstanceId());
            if ( primaryNode == null ) throw new RuntimeException("PrimaryMediator not found.");
            logger_.info("ping primary");
            exposeState = InstanceState.SECONDARY;
            setPrimaryClusterConfig(getX(), getPrimaryVote().getPrimaryInstanceId(), false);
            quorumInitial = new QuorumInitial(countDownLatch);
            quorumInitial.start();
            while ( true ) {
              try {
                Thread.sleep(1000);
              } catch ( InterruptedException e ) {
                logger_.info("SECONDARY: ",e);
              }
              // Heartbeat.
              PingService ping = (PingService) getX().get("ping");
              ping.ping(getX(), primaryNode.getId(), primaryNode.getServicePort());
            }
          } catch ( Exception e ) {
            logger_.error("SECONDARY: ", e);
          } finally {
            exposeState = InstanceState.ELECTING;
            resetPrimaryClusterConfig();
            setMyState(hostname_, InstanceState.ELECTING);
            if ( quorumInitial != null ) {
              quorumInitial.close();
              try {
                countDownLatch.await();
              } catch ( Exception e ) {
                logger_.error(e);
              }
            }
            logger_.info("leave Secondary");
          }
        } else {
          logger_.info("Wrong state");
          setMyState(hostname_, InstanceState.ELECTING);
          exposeState = InstanceState.ELECTING;
        }
      }
      logger_.info("end of election service");
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
        Thread.sleep(1000L);
        while ( isRunning ) {
          logger_.debug("QuorumInitial", "run", getMyState().getLabel());
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
            logger_.error("QuorumInitial", "run", e);
            if ( electable != null ) unReadyElectables.add(electable);
          }
        }
      }  catch ( InterruptedException e) {
        // nop;
      } finally {
        Electable electable;
        while ( ( electable = primaryElectables.poll() ) != null ) {
          electable.leavePrimary(getX());
          unReadyElectables.add(electable);
        }
        while ( ( electable = secondaryElectables.poll() ) != null ) {
          electable.leaveSecondary(getX());
          unReadyElectables.add(electable);
        }
        countDownLatch.countDown();
      }
    }
  }
}
