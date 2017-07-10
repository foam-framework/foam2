/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pool;

import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import foam.core.ContextAgent;
import foam.core.X;

public class FixedThreadPool
  extends AbstractFixedThreadPool
{
  protected ExecutorService pool_          = null;
  protected Object          queuedLock_    = new Object();
  protected Object          executingLock_ = new Object();
  protected Object          executedLock_  = new Object();

  class ContextAgentRunnable
    implements Runnable
  {
    final X            x_;
    final ContextAgent agent_;

    public ContextAgentRunnable(X x, ContextAgent agent) {
      x_     = x;
      agent_ = agent;
    }

    public void run() {
      incrExecuting(1);

      // TODO: PM
      try {
        agent_.execute(x_);
      } catch (Throwable t) {
        // TODO: log
      } finally {
        incrExecuting(-1);
        incrExecuted();
      }
    }
  }

  public FixedThreadPool() {
  }

  public void incrExecuting(int d) {
    synchronized ( executingLock_ ) {
      executing_ += d;
    }
  }

  public void incrExecuted() {
    synchronized ( executedLock_ ) {
      executed_++;
    }
  }

  public void incrQueued() {
    synchronized ( queuedLock_ ) {
      queued_++;
    }
  }

  public synchronized ExecutorService getPool() {
    if ( pool_ == null ) {
      pool_ = Executors.newFixedThreadPool(numberOfThreads_);
    }
    return pool_;
  }

  public void submit(X x, ContextAgent agent) {
    incrQueued();
    getPool().submit(new ContextAgentRunnable(x, agent));
  }
}
