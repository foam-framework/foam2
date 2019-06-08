package foam.nanos.ruler;

import foam.core.*;

public class ContextualizingRuleAgency
  extends ProxyAgency
{
  X userX_, systemX_;

  public ContextualizingRuleAgency(Agency delegate, X userX, X systemX) {
    super(delegate);
    userX_   = userX;
    systemX_ = systemX;
  }

  public void submit(X x, ContextAgent agent, String description) {
    if ( agent instanceof ContextAware) ((ContextAware) agent).setX(systemX_);

    super.submit(userX_, agent, description);
  }
}
