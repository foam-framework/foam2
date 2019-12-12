/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac.quorum;

import java.util.List;
import java.util.ArrayList;
import java.net.InetSocketAddress;

// This class contains network config for an instance in the cloud.
public class QuorumInstance {
    
    private long instanceId;

    // The ip of addr and electionAddr are same, but use different to do election.
    private InetSocketAddress addr = null;
    private InetSocketAddress electionAddr = null;

    private String hostName;

    private List<InetSocketAddress> addrs;

    public QuorumInstance(long instanceId, String addr, int serverPort, int electionPort) {
        this.instanceId = instanceId;
        this.addr = new InetSocketAddress(addr, serverPort);
        this.electionAddr = new InetSocketAddress(addr, electionPort);
        addToAddrs();
    }

    public long getInstanceId() {
        return this.instanceId;
    }

    private void addToAddrs() {
        this.addrs = new ArrayList<InetSocketAddress>();
        this.addrs.add(addr);
        this.addrs.add(electionAddr);
    }

}