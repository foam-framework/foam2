/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/
package foam.nanos.medusa.quorum;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

import foam.core.X;
import foam.core.AbstractFObject;
import foam.core.Detachable;
import foam.core.FoamThread;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.nanos.medusa.ClusterConfig;
import foam.nanos.medusa.ClusterConfigService;
import static foam.mlang.MLang.*;
import foam.dao.ArraySink;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;

// This class should be singlton.
public class Election extends AbstractFObject {

  // QuorumNetworkManager handles network communication for a Election.
  private final QuorumNetworkManager networkManager;
  protected String hostname = System.getProperty("hostname");
  private String clusterId;
  ClusterConfig mySelf;

  // Manage meta of current instance.
  private QuorumName quorumName;
  private QuorumService quorumService;

  // Sender will send message in the queue.
  LinkedBlockingQueue<QuorumMessage> sendQueue;
  // Receiver will sanitize and put reponse into the queue.
  LinkedBlockingQueue<QuorumMessage> receptedQueue;
  private Logger logger;

  public Election(X x, QuorumNetworkManager networkManager, QuorumService quorumService) {
    setX(x);
    if ( x == null ) throw new RuntimeException("Context no found.");

    logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName() },
      (Logger) x.get("logger"));

    DAO clusterDAO = (DAO) x.get("clusterConfigDAO");
    if ( clusterDAO == null ) throw new RuntimeException("clusterConfigDAO not found.");

    ArraySink sink = (ArraySink) clusterDAO
                                  .where(EQ(ClusterConfig.ID, hostname))
                                  .select(new ArraySink());
    List list = sink.getArray();
    if ( list.size() != 1 ) throw new RuntimeException("error on clusterConfig journal");
    mySelf = (ClusterConfig) list.get(0);
    clusterId = mySelf.getId();
    //mySelf = (ClusterConfig) clusterDAO.find(clusterId);
    if ( mySelf == null ) throw new RuntimeException("ClusterConfig no found: " + hostname);

    this.networkManager = networkManager;
    this.quorumService = quorumService;
    sendQueue = new LinkedBlockingQueue<QuorumMessage>();
    receptedQueue = new LinkedBlockingQueue<QuorumMessage>();
    sendAndReceiver = new SenderAndReceiver();
    sendAndReceiver.start();
  }

  // Initial value will be 0. When this instance broadcast with initial value,
  // it will get current electionEra in the cluster.
  AtomicLong electionEra = new AtomicLong(1);

  String proposedPrimary;
  String proposedCriteria;
  Long proposedPrimaryEra;

  SenderAndReceiver sendAndReceiver;

  volatile boolean isRunning = true;

  private int pollInteval = 200;

  // Quorum size.
  private long quorumSize = 1L; //2L;

  public Election(QuorumNetworkManager networkManager, QuorumName quorumName) {
    this.networkManager = networkManager;
    this.quorumName     = quorumName;
    sendQueue           = new LinkedBlockingQueue<QuorumMessage>();
    receptedQueue       = new LinkedBlockingQueue<QuorumMessage>();
    sendAndReceiver     = new SenderAndReceiver();
    sendAndReceiver.start();
  }

  private void endOfElection(Vote vote) {
    receptedQueue.clear();
  }

  private ClusterConfig findClusterConfig(String instanceId) {
    DAO dao = (DAO) getX().get("clusterConfigDAO");
    return (ClusterConfig) dao.find(instanceId);
  }

  private boolean verifyGroup(String instanceId) {
    ClusterConfig instance = findClusterConfig(instanceId);
    if ( instance == null ) return false;
    if ( instance.getZone() == mySelf.getZone() &&
         instance.getType() == foam.nanos.medusa.MedusaType.MEDIATOR ) return true;
    return false;
  }

  private boolean isVoter(String instanceId) {
    ClusterConfig instance = findClusterConfig(instanceId);
    if ( instance == null ) return false;
    logger.debug("isVoter", instanceId, instance.getZone());
    return instance.getZone() == 0;
  }

  private boolean isSelf(String instanceId) {
    return instanceId == mySelf.getId();
  }

  class SenderAndReceiver {

    class Receiver extends FoamThread {

      volatile boolean isRunning = true;

      Receiver() {
        super("Election.SenderAndReceiver.Receiver[id=" + mySelf.getId() + "]");
      }

      public void run() {

        while ( isRunning ) {
          // logger.debug("Receiver", "run");
          try {
            Thread.sleep(1000L);
            // Get response from NetworkManager in every two second.
            QuorumMessage inMessage = networkManager.pollResponseQueue(pollInteval, TimeUnit.MILLISECONDS);
            if ( inMessage == null ) {
              logger.debug("Receiver", "run", "inMessage null");
              continue;
            }

            // If voter is not belong to the same group, ignore packet
            if ( ! verifyGroup(inMessage.getSourceInstance()) ) {
              //TODO: exit until configuration updated.
              logger.debug("Receiver", "run", "verifyGroup false");
              continue;
            }

            // Return latest Vote from this instance.
            if ( ! isVoter(inMessage.getSourceInstance()) ) {
              logger.debug("Receiver", "run", "! isVoter");
              Vote vote = quorumService.getPrimaryVote();
              QuorumMessage response = new QuorumMessage();
              response.setMessageType(QuorumMessageType.NOTIFICATION);
              response.setDestinationInstance(inMessage.getSourceInstance());
              response.setSourceInstance(mySelf.getId());
              response.setSourceStatus(quorumService.getMyState());
              // Very important!!
              vote.setElectionEra(electionEra.get());
              response.setVote(vote);
              sendQueue.offer(response);
            } else {
              // If this instance is electing, then doing election and sending proposed Primary.
              if ( quorumService.getMyState() == InstanceState.ELECTING ) {
                logger.debug("Receiver", "run", "accepting offer", inMessage);
                receptedQueue.offer(inMessage);

                // If request instance lag this instance, send back message with current electionEra and CurrentVote.
                if ( inMessage.getSourceStatus() == InstanceState.ELECTING
                     && inMessage.getVote().getElectionEra() < electionEra.get() ) {
                  logger.debug("Receiver", "run", "BOTH ELECTING", "sending offer");

                  Vote vote = getVote();
                  // Set electionEra of this instance into vote.
                  vote.setElectionEra(electionEra.get());
                  QuorumMessage response = new QuorumMessage();
                  response.setMessageType(QuorumMessageType.NOTIFICATION);
                  response.setDestinationInstance(inMessage.getSourceInstance());
                  response.setSourceInstance(mySelf.getId());
                  response.setSourceStatus(quorumService.getMyState());
                  response.setVote(vote);
                  sendQueue.offer(response);
                }

              } else {
                // The cluster has picked a primary already. Send back Vote for leader.
                if ( inMessage.getSourceStatus() == InstanceState.ELECTING ) {
                  logger.debug("Receiver", "run", "OTHER ELECTING", "sending offer");


                  //TODO: provide a way to allow all voter to have a change to vote at lease once.

                  //Vote should set both electionEra and primaryEra
                  Vote latestVote = quorumService.getPrimaryVote();
                  QuorumMessage response = new QuorumMessage();
                  response.setMessageType(QuorumMessageType.NOTIFICATION);
                  response.setDestinationInstance(inMessage.getSourceInstance());
                  response.setSourceInstance(mySelf.getId());
                  response.setSourceStatus(quorumService.getMyState());
                  response.setVote(latestVote);
                  sendQueue.offer(response);
                }
              }
            }
          } catch ( InterruptedException e) {
            //TODO: warn
          }

        }
      }
    }

    class Sender extends FoamThread {
      volatile boolean isRunning = true;

      Sender() {
        super("Election.SenderAndReceiver.Sender[id=" + mySelf.getId() + "]");
      }

      public void run() {
        while ( isRunning ) {
          //          logger.debug("Sender", "run");
          try {
            Thread.sleep(1000L);
            QuorumMessage message = sendQueue.poll(pollInteval, TimeUnit.MICROSECONDS);
            if ( message == null ) {
              continue;
            }
            networkManager.sendToInstance(message.getDestinationInstance(), message);

          } catch ( InterruptedException e ) {
            // leave the loop.
            break;
          }
          //Log sender shutdown.
        }
      }
    }

    Sender sender;
    Receiver receiver;

    SenderAndReceiver() {
      sender = new Sender();
      receiver = new Receiver();
    }

    void start() {
      sender.start();
      receiver.start();
    }

    void close() {
      sender.isRunning = false;
      receiver.isRunning = false;
    }
  }


  // The method will hold til a primary is found.
  // The PRIMARY will be one who has biggest criteria value in the cloud.
  public Vote electingPrimary() {
    //TODO: Log start election
    logger.debug("electingPrimary");
    try {
      // Store vote for current election era.
      Map<String, Vote> voteMap = new HashMap<String, Vote>();

      Map<Long, Vote> outOfElection = new HashMap<Long, Vote>();

      //TODO: replace with IP address.
      String initialCriteria   = mySelf.getId();
      Long initialPrimaryEra = electionEra.get();

      synchronized(this) {
        electionEra.incrementAndGet();
        // Initially propose mySelf as leader.
        // We do not need to consensus data right now,
        // so set initial proposePrimaryEra equal to electionEra
        updateProposal(mySelf.getId(), initialPrimaryEra, initialCriteria);
      }

      // Propose mySelf as Leader.
      broadcast();

      //TODO: have a class to record all received Votes.
      //QuorumVoteSet voteSet;

      while ( quorumService.getMyState() == InstanceState.ELECTING && isRunning ) {
        logger.debug("electingPrimary", "ELECTING");
        QuorumMessage inMessage = receptedQueue.poll(pollInteval, TimeUnit.MICROSECONDS);
        if ( inMessage == null ){
          broadcast();
        } else {

          if (  ! isVoter(inMessage.getSourceInstance()) ) continue;
          if (  ! isVoter(inMessage.getVote().getPrimaryInstanceId()) ) continue;

          if ( inMessage.getSourceStatus() == InstanceState.ELECTING ) {
            // criteria == -1 means that sending instance is close.
            if ( inMessage.getVote().getCriteria() == "-1" ) break;
            // If current instance electionEra lags sending instance,
            // current instance needs to update its electionEra and
            // clean votes that current instance already stores.

            Vote vote = inMessage.getVote();

            if ( vote.getElectionEra() > electionEra.get() ) {
              // Reset voteMap.
              voteMap.clear();
              electionEra.set(vote.getElectionEra());

              if ( initialCriteria.compareTo(vote.getCriteria()) > 0 ) {
                // Re-proposal SELF as PRIMARY.
                updateProposal(mySelf.getId(), initialPrimaryEra, initialCriteria);
              } else {
                // Accept new vote.
                updateProposal(vote.getPrimaryInstanceId(), vote.getPrimaryEra(), vote.getCriteria());
                continue;
              }
              // Broadcast changes.
              broadcast();
            } else if ( vote.getElectionEra() < electionEra.get() ) {
              // The type of Vote is already handled by SenderAndReceiver.
              //TODO: Log
            } else {
              if ( proposedCriteria.compareTo(vote.getCriteria() ) < 0 ) {
                //Reset voteMap.
                voteMap.clear();
                // Accept new vote.
                updateProposal(vote.getPrimaryInstanceId(), vote.getPrimaryEra(), vote.getCriteria());
                broadcast();
                continue;
              }
            }
            //TODO: Check if sourceInstance alread exists?
            if ( proposedCriteria.equals(vote.getCriteria()) ) {
              voteMap.put(inMessage.getSourceInstance(), new Vote(proposedPrimary, electionEra.get(), proposedPrimaryEra, proposedCriteria));
            }

            if ( voteMap.size() >= quorumSize ) {

              QuorumMessage finalMessage;
              while ( (finalMessage =  receptedQueue.poll(pollInteval, TimeUnit.MICROSECONDS)) != null ) {
                if ( ! finalMessage.getVote().getPrimaryInstanceId().equals(proposedPrimary) ) {
                  // Proposed Primary in the cluster has changed.
                  // Send message back to the queue and re-process it.
                  receptedQueue.put(finalMessage);
                  voteMap.clear();
                  break;
                }
              }

              if ( finalMessage == null ) {
                updateState(proposedPrimary);
                Vote primaryVote = new Vote(proposedPrimary, electionEra.get(), proposedPrimaryEra, proposedCriteria);
                finishElection(primaryVote);
                return primaryVote;
              }
            }
          } else if ( inMessage.getSourceStatus() == InstanceState.PRIMARY || inMessage.getSourceStatus() == InstanceState.SECONDARY ) {
            // The cluster has a Primary already.
            // Send back QuorumMessage with current PRIMARY info is enough.

            // The instance intend to join this era of election,
            // but somehow there is a Primary picked in the cloud.

            Vote vote = inMessage.getVote();
            if ( vote.getElectionEra() != electionEra.get()
                 || ! vote.getPrimaryInstanceId().equals(proposedPrimary) ) {
              voteMap.clear();
              electionEra.set(vote.getElectionEra());
              updateProposal(vote.getPrimaryInstanceId(), vote.getPrimaryEra(), vote.getCriteria());
              receptedQueue.put(inMessage);
              continue;
            }

            if ( proposedCriteria.equals(vote.getCriteria()) ) {
              voteMap.put(inMessage.getSourceInstance(), new Vote(proposedPrimary, electionEra.get(), proposedPrimaryEra, proposedCriteria));
            }

            if ( voteMap.size() >= quorumSize ||
                 voteMap.get(proposedPrimary) != null ) {
              updateState(proposedPrimary);
              Vote primaryVote = new Vote(proposedPrimary, electionEra.get(), proposedPrimaryEra, proposedCriteria);
              finishElection(primaryVote);
              return primaryVote;
            }

          } else {
            logger.info("error state.");
          }
        }
      }
    } catch ( Exception e ) {
      //TODO: log error.
    }
    return null;
  }

  private void updateState(String proposedLeader) {
    if ( clusterId.equals(proposedLeader) ) quorumService.setMyState(proposedLeader, InstanceState.PRIMARY);
    else quorumService.setMyState(proposedLeader, InstanceState.SECONDARY);
  }

  // Tell every other instance in the cluser: I changed vote.
  // The function only invoke when this instance is in ELECTING status.
  protected void broadcast() {
    DAO clusterConfigDAO = (DAO) getX().get("clusterConfigDAO");
    ClusterConfigService service = (ClusterConfigService) getX().get("clusterConfigService");
    clusterConfigDAO.where(service.getVoterPredicate(getX()))
       .select(
      new AbstractSink() {
        @Override
        public void put(Object obj, Detachable sub) {
          try {
            // Give system enough time to handle inflight request.
            Thread.sleep(1000);
          } catch ( InterruptedException e ) {
            logger.info(e);
          }
          ClusterConfig clusterConfig = (ClusterConfig) obj;
          if ( clusterConfig.getId() == mySelf.getId() ) {
            return;
          }
          QuorumMessage message = new QuorumMessage();
          message.setMessageType(QuorumMessageType.NOTIFICATION);
          message.setDestinationInstance(clusterConfig.getId());
          message.setSourceInstance(mySelf.getId());
          message.setSourceStatus(InstanceState.ELECTING);
          Vote vote = getVote();
          vote.setElectionEra(electionEra.get());
          message.setVote(vote);
          logger.debug("broadcast offer");
          sendQueue.offer(message);
        }
      }
    );
  }

  protected Vote finishElection(Vote vote) {
    receptedQueue.clear();
    return vote;
  }

  protected boolean reachHalf(Set<Vote> votes) {
    return false;
  }

  public void close() {
    proposedCriteria = "-1";
    proposedPrimary = "-1";
  }


  // Metux with updateProposal method.
  public synchronized Vote getVote() {
    Vote vote = new Vote();
    vote.setPrimaryInstanceId(proposedPrimary);
    vote.setPrimaryEra(proposedPrimaryEra);
    vote.setCriteria(proposedCriteria);
    return vote;
  }

  synchronized void updateProposal(String primary, long era, String criteria) {
    this.proposedPrimary = primary;
    this.proposedPrimaryEra = era;
    this.proposedCriteria = criteria;
  }
}
