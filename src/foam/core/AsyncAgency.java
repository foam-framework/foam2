package foam.core;

public class AsyncAgency implements Agency {

  public void submit(X x, ContextAgent agent) {
    agent.execute(x);
  }
  public void submit(X x, ContextAgent agent, String description) {
    agent.execute(x);
  }
}
