package foam.nanos.ruler;

import foam.core.CompoundContextAgent;
import foam.core.ContextAgent;
import foam.core.ContextAware;
import foam.core.X;

public class ContextualizingRuleAgency
  extends CompoundContextAgent
{
  X userX_, systemX_;

  public ContextualizingRuleAgency(X userX, X systemX) {
    userX_   = userX;
    systemX_ = systemX;
  }

  public void submit(X x, ContextAgent agent) {
    if ( agent instanceof ContextAware) ((ContextAware) agent).setX(systemX_);

    super.submit(userX_, agent);
  }
}
