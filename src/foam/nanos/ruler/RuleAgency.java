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
    return "Rule " + rule_.getId() + "{ " + super.toString() + "}";
  }
}
