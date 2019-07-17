package foam.nanos.pool;

import foam.core.ContextAgent;
import foam.core.ContextAgentRunnable;
import foam.core.X;

import java.util.LinkedList;
import java.util.Queue;

public class StubThreadPool implements ThreadPool {
  Queue<Runnable> agents = new LinkedList<>();

  @Override
  public void submit(X x, ContextAgent agent) {
    agents.add(new ContextAgentRunnable(x, agent, getClass().getSimpleName()));
  }

  public void invokeAll() {
    while ( ! agents.isEmpty() ) {
      agents.poll().run();
    }
  }
}
