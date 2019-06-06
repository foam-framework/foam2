package foam.nanos.ruler;

import foam.core.CompoundContextAgent;
import foam.core.ContextAgent;
import foam.core.ContextAware;
import foam.core.X;

public class ProbeRuleAgency
  extends CompoundContextAgent
{
  protected Rule rule_;

  public ProbeRuleAgency(Rule rule) {
    rule_ = rule;
  }

  public Rule getRule() {
    return rule_;
  }

  public void submit(X x, ContextAgent agent) {
    if ( agent instanceof ContextAware)
      System.out.print("s");
      //((ContextAware) agent).setX(getX());
    super.submit(x, agent);
  }

  public void execute() {
     // Probe Agency should never be executed
  }

  public String toString() {
    StringBuilder sb = new StringBuilder();
    return sb.append("Rule ").append(rule_.getId()).append(". Description: ").append(rule_.getDocumentation()).
      append( "{ ").append(super.toString()).append("}").toString();
  }
}
