package foam.nanos.ruler;

import foam.core.CompoundContextAgent;

public class RuleAgency
  extends CompoundContextAgent
{
  protected Rule rule_;

  public RuleAgency(Rule rule) {
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
