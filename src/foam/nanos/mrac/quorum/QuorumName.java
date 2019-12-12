/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac.quorum;

import foam.nanos.mrac.ClusterNode;

// This class manages meta info for a node in a cluster.
// Other service may use this class to varify if the service can be run or not.
public class QuorumName {
    
    private long id;
    private long group;
    private ClusterNode self;

    private InstanceState curState;
    
    private QuorumRecord quorumRecord;

    private volatile Vote latestVote;

    public Primary primary;
    public Secondary secondary;

    
    public ClusterNode getSelf() {
        return self;
    }

    public long getGroup() {
        return group;
    }

    // Make this function thread safe
    public QuorumRecord getQuorumRecord() {
        return quorumRecord;
    }

    public InstanceState getCurrentState() {
        return curState;
    }

    public long getId() {
        return id;
    }

    public synchronized Vote getLatestVote() {
        return latestVote;
    }

    public synchronized void setLastestVote(Vote vote) {
        this.latestVote = vote;
    }

}