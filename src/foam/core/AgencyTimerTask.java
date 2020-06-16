/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.core.Agency;
import foam.core.ContextAgent;
import foam.core.X;
import java.util.TimerTask;

/**
  TimerTask which submits a ContextAgent to the Agency threadpool
*/
public class AgencyTimerTask
  extends TimerTask {

  X x_;
  ContextAgent agent_;
  String threadPoolName_ = "threadPool";

  public AgencyTimerTask(X x, String threadPoolName, ContextAgent agent) {
    super();
    this.x_ = x;
    this.agent_ = agent;
    this.threadPoolName_ = threadPoolName;
  }

  public AgencyTimerTask(X x, ContextAgent agent) {
    super();
    this.x_ = x;
    this.agent_ = agent;
  }

  public void run() {
    ((Agency) x_.get(threadPoolName_)).submit(x_, agent_, agent_.getClass().getSimpleName());
  }
}
