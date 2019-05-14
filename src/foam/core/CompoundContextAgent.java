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
public class CompoundContextAgent
  implements ContextAgent, Agency
{
  protected ArrayList<Runnable> agents_ = new ArrayList();

  public CompoundContextAgent() {
  }

  public void submit(X x, ContextAgent agent) {
    agents_.add(new ContextAgentRunnable(x, agent));
  }

  public void execute(X x) {
    for ( Runnable agent : agents_ ) {
      try {
        agent.run();
      } catch (Throwable t) {
      }
    }
  }

  public String toString() {
    StringBuilder sb = new StringBuilder();
    boolean first = true;
    for ( Runnable agent : agents_ ) {
      if ( first ) {
        first = false;
      } else {
        sb.append("\n");
      }
      sb.append(agent.toString());
    }

    return sb.toString();
  }

  public String[] describe() {
    String[] desc = new String[agents_.size()];

    for ( int i = 0 ; i < agents_.size() ; i++ ) {
      desc[i] = agents_.get(i).toString();
    }

    return desc;
  }
}
