/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac.quorum;

import java.util.Set;
import java.util.HashMap;
import java.util.Map;

//TODO: refactor into a DAO.
public class QuorumRecord {

    private Map<Long, QuorumInstance> allInstances = new HashMap<Long, QuorumInstance>();
    private Map<Long, QuorumInstance> electingInstances = new HashMap<Long, QuorumInstance>();
    private int threhold;

    public QuorumRecord(Map<Long, QuorumInstance> allInstances) {
        allInstances.putAll(allInstances);
        electingInstances.putAll(allInstances);
        threhold = electingInstances.size() / 2;
    }

    // Make sure that instances is a set that all members agree with same Primary in a same election era.
    public boolean containsQuorum(Set<Long> instances) {
        return instances.size() > threhold;
    }

    public Map<Long, QuorumInstance> allInstances() {
        return allInstances;
    }

    public Map<Long, QuorumInstance> electingInstances() {
        return electingInstances;
    }

    public boolean isInstanceValidToVote(long instanceId) {
        return electingInstances.keySet().contains(instanceId);
    }
}