/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

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
    try {
      agent_.execute(x_);
    } catch (Throwable t) {
    }
  }
}
