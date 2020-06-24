/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util.concurrent;

import java.util.Arrays;
import foam.core.X;

/**
 * A Synchronous blocking implementation of the AssemblyLine interface.
 * Rather than using a thread pool, it uses the calling thread
 * which it blocks until completion.
 **/
public class SyncAssemblyLine
  implements AssemblyLine
{
  protected Assembly q_         = null;
  protected Object   startLock_ = new Object();
  protected Object   endLock_   = new Object();
  protected X        x_;
  protected boolean  shutdown_  = false;

  public SyncAssemblyLine() {
  }

  public SyncAssemblyLine(X x) {
    x_ = x;
  }

  /*
    public void enqueue(Assembly job) {
    Object[] locks = job.requestLocks();

    if ( locks != null ) {
    Arrays.sort(locks);
    acquireLocksThenEnqueue(locks, job, 0);
    } else {
    enqueue_(job);
    }
    }
  */

  public void enqueue(Assembly job) {
    if ( shutdown_ ) throw new IllegalStateException("Can't enqueue into a shutdown AssemblyLine.");

    final Assembly[] previous = new Assembly[1];

    try {
      synchronized ( startLock_ ) {
        if ( q_ != null ) q_.markNotLast();
        previous[0] = q_;
        q_ = job;
        try {
          job.executeUnderLock();
          job.startJob();
        } catch (Throwable t) {
          q_ = previous[0];
          throw t;
        }
      }
      job.executeJob();
      if ( previous[0] != null ) previous[0].waitToComplete();
      previous[0] = null;
      synchronized ( endLock_ ) {
        try {
          job.endJob();
        } catch (Throwable t) {
          foam.nanos.logger.Logger logger;
          if ( x_ != null ) {
            logger = (foam.nanos.logger.Logger) x_.get("logger");
          } else {
            logger = new foam.nanos.logger.StdoutLogger();
          }
          logger.error(this.getClass().getSimpleName(), t.getMessage(), t);
        } finally {
          job.complete();
        }
      }
    } finally {
      // Isn't required, but helps GC last entry.
      synchronized ( startLock_ ) {
        // If I'm still the only job in the queue, then remove me
        if ( q_ == job ) q_ = null;
      }
    }
  }

  public void shutdown() {
    enqueue(new AbstractAssembly() {
      public void startJob() {
        shutdown_ = true;
      }
    });
  }

  public void acquireLocksThenEnqueue(Object[] locks, Assembly job, int lockIndex) {
    if ( lockIndex >= locks.length ) {
      job.executeUnderLock();
      enqueue(job);
    } else {
      synchronized ( locks[lockIndex] ) {
        acquireLocksThenEnqueue(locks, job, lockIndex+1);
      }
    }
  }
}
