/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pool;

import foam.core.Agency;
import foam.core.ContextAgent;
import foam.core.X;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import java.util.concurrent.*;

public class ThreadPoolAgency
  extends    AbstractFixedThreadPool
  implements Agency
{
  protected ThreadPoolExecutor pool_          = null;
  protected Object             queuedLock_    = new Object();
  protected Object             executingLock_ = new Object();
  protected Object             executedLock_  = new Object();

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

      Logger logger = (Logger) x_.get("logger");
      PM     pm     = new PM(this.getClass(), agent_.getClass().getName());

      try {
        agent_.execute(x_);
      } catch (Throwable t) {
        logger.error(this.getClass(), t.getMessage(), t);
      } finally {
        incrExecuting(-1);
        incrExecuted();
        pm.log(getX());
      }
    }
  }

  public ThreadPoolAgency() {
    /* GC threads that haven't been used for 10 seconds. */
    pool_ = new ThreadPoolExecutor(
      getNumberOfThreads(),
      getNumberOfThreads(),
      10,
      TimeUnit.SECONDS,
      new LinkedBlockingQueue<Runnable>()
    );
    pool_.allowCoreThreadTimeOut(true);
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

  public ExecutorService getPool() {
    return pool_;
  }

  // TODO: reverse order of 2nd and 3rd args
  public void submit(X x, ContextAgent agent, String description) {
    incrQueued();
    getPool().submit(new ContextAgentRunnable(x, agent));
  }
}
