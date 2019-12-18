/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import foam.nanos.mrac.AbstractSyncSink;

// Socket should be async by nature.
public class SocketSyncSink extends AbstractSyncSink {

    public SocketSyncSink(boolean asyn) {
        super(asyn);
    }

    public SocketSyncSink() {
        super(false);
    }

    @Override
    public void doPut(Object obj) {
        
    }
}