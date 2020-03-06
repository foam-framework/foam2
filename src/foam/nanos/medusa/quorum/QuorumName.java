/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa.quorum;

import foam.nanos.medusa.ClusterNode;

// This class manages meta info for a node in a cluster.
// Other service may use this class to varify if the service can be run or not.
public class QuorumName {
    
    private long id;
    private long group;
    private ClusterNode self;

    private InstanceState curState;

    private volatile Vote latestVote;

    
    public ClusterNode getSelf() {
        return self;
    }

    public long getGroup() {
        return group;
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