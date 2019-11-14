/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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

   public void enqueue(Assembly job) {
     Assembly previous = null;

     synchronized ( startLock_ ) {
       previous = q_;
       q_ = job;
       job.startJob();
     }

     job.executeJob();

     if ( previous != null ) previous.waitToComplete();

     synchronized ( endLock_ ) {
       job.endJob();
       job.complete();
     }

     // Isn't required, but helps GC last entry.
     synchronized ( startLock_ ) {
       // If I'm still the only job in the queue, then remove me
       if ( q_ == job ) q_ = null;
     }
   }
 }
