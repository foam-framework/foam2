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

// Initial QuorumNetworkManager and Election.
// Start voting.
public class QuorumService extends AbstractFObject implements NanoService {

  protected Long clusterId = Long.parseLong(System.getProperty("CLUSTER"));
  private ClusterNode mySelf;
  private QuorumNetworkManager networkManager;
  private Election election;
  public volatile InstanceState myState = InstanceState.ELECTING;
  public volatile Vote primaryVote;
  private RunElection runElection;

  public QuorumService(X x) {
    System.out.println("QuorumServer");
    setX(x);
    if ( x == null ) throw new RuntimeException("Context no found.");
    DAO clusterDAO = (DAO) x.get("clusterNodeDAO");
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
            while(true){}
            //isReset = false;
          } catch ( Exception e ) {
            setMyState(InstanceState.ELECTING);
          }
        } else if ( getMyState() == InstanceState.PRIMARY ) {
          System.out.println("Primary");
          try {
            while ( ! isReset ) {
              //TODO: heartBeat
            }
          } catch ( Exception e ) {
            //TODO: log e
          } finally {
            setMyState(InstanceState.ELECTING);
          }
        } else if ( getMyState() == InstanceState.SECONDARY ) {
          System.out.println("Secondary");
          try {
            while ( ! isReset ) {
              //TODO: heartBeat
            }
          } catch ( Exception e ) {
            //TODO: log e
          } finally {
            setMyState(InstanceState.ELECTING);
          }
        } else {
          System.out.println("Wrong state");
          setMyState(InstanceState.ELECTING);
        }
      }

    }

    public void close() {
      isRunning = false;
    }
  }

}
