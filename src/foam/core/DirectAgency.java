/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.core.Agency;
import foam.core.ContextAgent;
import foam.core.X;

/**
 * AsyncAgency is passed to async rule.action
 * for immediate execution of agent.
 */
public class DirectAgency implements Agency {
  public void submit(X x, ContextAgent agent, String description) {
    agent.execute(x);
  }
}
