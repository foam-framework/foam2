package foam.nanos.pool;

import foam.core.Agency;
import foam.core.ContextAgent;
import foam.core.ContextAgentRunnable;
import foam.core.X;

import java.util.LinkedList;
import java.util.Queue;

public class AgentAgency implements Agency {
  Queue<Runnable> agents = new LinkedList<>();

  @Override
  public void submit(X x, ContextAgent agent, String description) {
    agents.add(new ContextAgentRunnable(x, agent, description));
  }

  public void execute() {
    while ( ! agents.isEmpty() ) {
      agents.remove().run();
    }
  }
}
