/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.ArrayList;

/**
 * A ContextAgent which is itself an Agency.
 * When ContextAgents are submit()'ed to the service it queues them
 * but doesn't execute them until it is itself executed.
 **/
public class CompoundAgency
  implements Agency
{
  protected CompoundContextAgent agent_;

  public CompoundAgency(CompoundContextAgent agent) {
    agent_ = agent;
  }

  public void submit(X x, ContextAgent agent, String description) {
    agent_.agents_.add(new ContextAgentRunnable(x, agent, description));
  }

  public void submit(X x, ContextAgent agent) {
    submit(x, agent, "");
  }
}
