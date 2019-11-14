/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util.concurrent;

public interface Assembly {
 /**
  * Execute serially before start of job.
  * Good place to take locks, assign sequence number, etc.
  **/
 public void startJob();

 /**
  * Execute concurrent part of the job.
  **/
 public void executeJob();

 /**
  * Execute serial part of the job once it leaves the queue.
  * @param lastJob true iff there are no more jobs in the queue.
  **/
 public void endJob();

 /**
  * @return true iff this is the last Assembly currently in the queue.
  * Determined if waitToComplete() has been called.
  **/
 public boolean isLast();

 /**
  * Mark this Assembly as having completed.
  * Will notify to unblock thread blocked by waitToComplete().
  **/
 public void complete();

 /**
  * Block until the Assembly becomes complete.
  * Calling lets Assembly know it isn't last in queue.
  **/
 public void waitToComplete();

}
