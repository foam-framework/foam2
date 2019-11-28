/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public class ContextAgentRunnable
  implements Runnable
{
  final protected X            x_;
  final protected ContextAgent agent_;
  final protected String description_;

  public ContextAgentRunnable(X x, ContextAgent agent, String description) {
    x_     = x;
    agent_ = agent;
    description_ = description;
  }

  public String toString() {
    return description_;
  }

  public void run() {
    agent_.execute(x_);
  }
}
