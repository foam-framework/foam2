/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.core;

 /**
 * ContextualizingAgency takes two contexts in constructor: systemX_ is set for agent.x, 
 * userX_ is used to submit the agent to agency.
 **/
public class ContextualizingAgency
  extends ProxyAgency
{
  X userX_, systemX_;

  public ContextualizingAgency(Agency delegate, X userX, X systemX) {
    super(delegate);
    userX_   = userX;
    systemX_ = systemX;
  }

  public void submit(X x, ContextAgent agent, String description) {
    if ( agent instanceof ContextAware) ((ContextAware) agent).setX(systemX_);
    super.submit(userX_, agent, description);
  }
}
