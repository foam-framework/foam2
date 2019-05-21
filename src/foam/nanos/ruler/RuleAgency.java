package foam.nanos.ruler;

import foam.core.CompoundContextAgent;
import foam.core.X;

public class RuleAgency
  extends CompoundContextAgent
{
  protected Rule rule_;

  public RuleAgency(X x, Rule rule) {
    super(x);
    rule_ = rule;
  }

  public Rule getRule() {
    return rule_;
  }

  public String toString() {
    StringBuilder sb = new StringBuilder();
    return sb.append("Rule ").append(rule_.getId()).append(". Description: ").append(rule_.getDocumentation()).
      append( "{ ").append(super.toString()).append("}").toString();
  }
}
