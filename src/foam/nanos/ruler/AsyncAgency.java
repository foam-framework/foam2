package foam.nanos.ruler;

import foam.core.Agency;
import foam.core.ContextAgent;
import foam.core.X;

/**
 * AsyncAgency is passed to async rule.action
 * for immediate execution of agent.
 */
public class AsyncAgency implements Agency {

  public void submit(X x, ContextAgent agent) {
    agent.execute(x);
  }
  public void submit(X x, ContextAgent agent, String description) {
    agent.execute(x);
  }
}
