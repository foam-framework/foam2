/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util.concurrent;

import foam.core.Agency;
import foam.core.ContextAgent;
import foam.core.X;
import java.util.concurrent.Semaphore;

/**
* An Aynchronous implementation of the AssemblyLine interface.
* Uses the threadpool to avoid blocking the caller.
**/
public class AsyncAssemblyLine
  extends SyncAssemblyLine
{
  protected Agency   pool_;
  protected String   agencyName_ = "AsyncAssemblyLine";
  protected boolean  shutdown_   = false;

  public AsyncAssemblyLine(X x) {
    this(x, "threadPool");
  }

  public AsyncAssemblyLine(X x, String agencyName) {
    super(x);
    pool_ = (Agency) x.get("threadPool");
    agencyName_ += ":" + agencyName;
  }

  public void enqueue(Assembly job) {
    if ( shutdown_ ) throw new IllegalStateException("Can't enqueue into a shutdown AssemblyLine.");

    final Assembly[] previous = new Assembly[1];

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

    pool_.submit(x_, new ContextAgent() { public void execute(X x) {
      try {
        job.executeJob();

        if ( previous[0] != null ) previous[0].waitToComplete();
        previous[0] = null;

        synchronized ( endLock_ ) {
          try {
            job.endJob();
          } catch (Throwable t) {
            ((foam.nanos.logger.Logger) x.get("logger")).error(this.getClass().getSimpleName(), agencyName_, t);
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
    }}, agencyName_);
  }

  public void shutdown() {
    try {
      Semaphore s = new Semaphore(1);
      s.acquire();

      enqueue(new AbstractAssembly() {
        public void startJob() {
          shutdown_ = true;
        }
        public void endJob() {
          s.release();
        }
      });
      s.acquire();
    } catch (InterruptedException e) {
    }
  }
}
