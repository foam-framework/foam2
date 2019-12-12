/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

package foam.nanos.mrac.quorum;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

import foam.core.AbstractFObject;
import foam.core.Detachable;
import foam.core.FoamThread;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.nanos.mrac.ClusterNode;

// This class should be singlton.
public class Election extends AbstractFObject {
	
	// QuorumNetworkManager handles network communication for a Election.
	QuorumNetworkManager networkManager;
	
	//TODO: DO not hard coding this field.
	QuorumRecord quorumRecord;
	
	// Manage meta of current instance.
	private QuorumName quorumName;
	
	// Sender will send message in the queue.
	LinkedBlockingQueue<QuorumMessage> sendQueue;
	// Receiver will sanitize and put reponse into the queue.
	LinkedBlockingQueue<QuorumMessage> receptedQueue;
	
	
	// Initial value will be 0. When this instance broadcast with initial value,
	// it will get current electionEra in the cluster.
	AtomicLong electionEra = new AtomicLong(0);
	
	Long proposedPrimary;
	Long proposedCriteria;
	Long proposedPrimaryEra;
	
	SenderAndReceiver sendAndReceiver;
	
	volatile boolean isRunning = true;
	
	private int pollInteval = 2000;
	
	public Election(QuorumNetworkManager networkManager, QuorumName quorumName) {
		this.networkManager = networkManager;
		this.quorumName = quorumName;
		sendQueue = new LinkedBlockingQueue<QuorumMessage>();
		receptedQueue = new LinkedBlockingQueue<QuorumMessage>();
		sendAndReceiver = new SenderAndReceiver();
		sendAndReceiver.start();
	}
	
	public void shutdown() {
		isRunning = false;
		sendAndReceiver.shutdown();
	}
	
	private void endOfElection(Vote vote) {
		receptedQueue.clear();
	}

	private ClusterNode findClusterNode(Long instanceId) {
		DAO dao = (DAO) getX().get("clusterNodeDAO");
		return (ClusterNode) dao.find(instanceId);
	}
	
	private boolean verifyGroup(Long instanceId) {
		ClusterNode instance = findClusterNode(instanceId);
		if ( instance == null ) return false;
		if ( instance.getGroup() == quorumName.getGroup() ) return true;
		return false;
	}

	private boolean isVoter(Long instanceId) {
		ClusterNode instance = findClusterNode(instanceId);
		if ( instance == null ) return false;
		return instance.getIsVoter() ? true : false;
	}

	private boolean isSelf(Long instanceId) {
		return instanceId == quorumName.getId();
	}

	class SenderAndReceiver {
		
		class Receiver extends FoamThread {
			
			volatile boolean isRunning = true;
			
			Receiver() {
				super("Election.SenderAndReceiver.Receiver[id=" + quorumName.getId() + "]");
			}
			
			public void run() {
				
				while ( isRunning ) {
					try {
						// Get response from NetworkManager in every two second.
						QuorumMessage inMessage = networkManager.pollResponseQueue(pollInteval, TimeUnit.MILLISECONDS);
						if ( message == null ) {
							continue;
						}
						
						// If voter is not belong to the same group, ignore packet
						if ( ! verifyGroup(inMessage.getSourceInstance()) ) {
							//TODO: log debug
							continue;
						}

						// Return latest Vote from this instance.
						if ( ! isVoter(inMessage.getSourceInstance()) ) {
							Vote vote = quorumName.getLatestVote();
							QuorumMessage response = new QuorumMessage();
							// message.setDestinationInstance()
						}
						
						// If this instance is electing, then doing election and sending proposed Primary.
						if ( quorumName.getCurrentState() == InstanceState.ELECTING ) {
							receptedQueue.offer(inMessage);
							
							// If request instance lag this instance, send back message with current electionEra and CurrentVote.
							if ( inMessage.getSourceStatus() == InstanceState.ELECTING 
							&& inMessage.getVote().getElectionEra() < electionEra.get() ) {
								Vote vote = getVote();
								// Set electionEra of this instance into vote.
								vote.setElectionEra(electionEra.get());
								QuorumMessage response = new QuorumMessage();
								response.setMessageType(QuorumMessageType.NOTIFICATION);
								response.setDestinationInstance(inMessage.getSourceInstance());
								response.setSourceInstance(quorumName.getId());
								response.setSourceStatus(quorumName.getCurrentState());
								response.setVote(getVote());
								sendQueue.offer(response);
							}
							
						} else {
							// The cluster has picked a primary already. Send back leader meta.
							if ( inMessage.getSourceStatus() == InstanceState.ELECTING ) {
								
								//TODO: shutdown leader if secondary make change.
								if ( quorumName.primary != null ) {}
								
								//Vote should set both electionEra and primaryEra
								Vote latestVote = quorumName.getLatestVote();
								QuorumMessage response = new QuorumMessage();
								response.setMessageType(QuorumMessageType.NOTIFICATION);
								response.setDestinationInstance(inMessage.getSourceInstance());
								response.setSourceInstance(quorumName.getId());
								response.setSourceStatus(quorumName.getCurrentState());
								response.setVote(latestVote);
								sendQueue.offer(response);
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
				super("Election.SenderAndReceiver.Sender[id=" + quorumName.getId() + "]");
			}
			
			public void run() {
				while ( ! isRunning ) {
					try {
						QuorumMessage message = sendQueue.poll(pollInteval, TimeUnit.MICROSECONDS);
						if ( message == null ) {
							continue;
						}
						networkManager.send(message.getDestinationInstance(), message);
						
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
		
		void shutdown() {
			sender.isRunning = true;
			receiver.isRunning = true;
		}
	}
	
	
	// The method will hold til a primary is found.
	public Vote electingPrimary() {
		try {
			Map<Long, Vote> curVoteSet = new HashMap<Long, Vote>();
			
			// Store 
			Map<Long, Vote> outOfElection = new HashMap<Long, Vote>();
			
			synchronized(this) {
				electionEra.incrementAndGet();
				updateProposal(quorumName.getId(), electionEra.get(), quorumName.getId());
			}
			
			//Initial a broadcast. Collaborating era with other instances in the clould.
			broadcast();
			
			QuorumVoteSet voteSet;
			
			while ( quorumName.getCurrentState() == InstanceState.ELECTING && isRunning ) {
				QuorumMessage message = receptedQueue.poll(pollInteval, TimeUnit.MICROSECONDS);
				
				if ( message == null ) {
					
				}
			}
			
		} catch ( Exception e ) {
			
		}
		return null;
	}
	
	// Tell every other instance in the cluser: I changed vote.
	// The function only invoke when this instance is in ELECTING status.
	protected void broadcast() {
		//TODO: get from DAO.
		DAO clusterNodeDAO = (DAO) getX().get("clusterNodeDAO");

		if ( clusterNodeDAO == null ) {
			//TODO: log error
			throw new RuntimeException("clusterNodeDAO miss");
		}
		//TODO: Do not hard code group id.
		clusterNodeDAO.where(MLang.EQ(ClusterNode.GROUP, 1)).select(
			new AbstractSink() {
				@Override
				public void put(Object obj, Detachable sub) {
					ClusterNode clusterNode = (ClusterNode) obj;
					QuorumMessage message = new QuorumMessage();
					message.setMessageType(QuorumMessageType.NOTIFICATION);
					message.setDestinationInstance(clusterNode.getId());
					message.setSourceInstance(quorumName.getId());
					message.setSourceStatue(InstanceState.ELECTING);
					Vote vote = getVote();
					vote.setElectionEra(electionEra.get());
					message.setVote(vote);
					sendQueue.offer(message);
				}
			}
		);
	}
	
	
	// Metux with updateProposal method.
	public synchronized Vote getVote() {
		Vote vote = new Vote();
		vote.setPrimaryInstanceId(proposedPrimary);
		vote.setPrimaryEra(proposedPrimaryEra);
		vote.setCriteria(proposedCriteria);
		return vote;
	}
	
	synchronized void updateProposal(long primary, long era, long criteria) {
		this.proposedPrimary = primary;
		this.proposedPrimaryEra = era;
		this.proposedCriteria = criteria;
	}
}