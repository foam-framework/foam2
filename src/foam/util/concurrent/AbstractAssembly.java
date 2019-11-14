/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO?: Could provide a reset() method if wanted to make reusable to avoid GC.

/**
 * Abstract implementation of Assembly interface.
 * Provides concurrency support.
 **/
public abstract class AbstractAssembly
  implements Assembly
{
  /** True once endJob() has executed. **/
  boolean complete_ = false;

  /** True if no newe Assembly is waiting for this task to complete. **/
  boolean isLast_   = true;

  public void startJob() {
   // Template method, override in subclass if desired
  }

  public void executeJob() {
   // Template method, override in subclass if desired
  }

  public void endJob() {
   // Template method, override in subclass if desired
  }

  public synchronized boolean isLast() {
   return isLast_;
  }

  public synchronized void complete() {
   complete_ = true;
   notify();
  }

  public synchronized void waitToComplete() {
   isLast_ = false;
   while ( ! complete_ ) {
     try {
       wait();
     } catch (InterruptedException e) {
       // NOP
     }
   }
  }
}
