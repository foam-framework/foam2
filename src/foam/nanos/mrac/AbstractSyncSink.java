/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import foam.dao.AbstractSink;

/** 
 * Abstract common methods for different types of SyncSink.
 * Different type means different call-back connection.
 * Broadcast all changes.
 */
// TODO: model this method.
public abstract class AbstractSyncSink extends AbstractSink {

    // Blocking or Non-Blocking sync.
    private final boolean asyn;
    // Using ThreadPool to eliminate the cost of create and destroy a thread.
    private ThreadPoolExecutor threadPool;
    //TODO: Use ClassInfo to get class name.
    private final String clazzName = this.getClass().getCanonicalName();
    

    public AbstractSyncSink(boolean asyn) {
        this.asyn = asyn;
        if ( this.asyn == true ) {
            // Initial ThreadPool.
            AtomicInteger counter = new AtomicInteger(1);
            ThreadFactory threadFactory = new ThreadFactory(){
            
                @Override
                public Thread newThread(Runnable runnable) {
                    Thread thread = new Thread(
                        runnable,
                        clazzName + "-[threadId=" + counter.getAndIncrement() + "]"
                    );
                    return thread;
                }
            };
            this.threadPool = new ThreadPoolExecutor(1, 1, 60, TimeUnit.SECONDS, new SynchronousQueue<Runnable>(), threadFactory);
            this.threadPool.allowCoreThreadTimeOut(true);
        }
    }

    public AbstractSyncSink() {
        this(false);
    }

    public void put(Object obj, foam.core.Detachable sub) {
        if ( this.asyn == true ) {
            this.threadPool.execute(new Runnable(){
                @Override
                public void run() {
                    doPut(obj);
                }
            });
        } else {
            doPut(obj);
        }
    }

    // Implementation should inplement this method.
    public abstract void doPut(Object obj);
}