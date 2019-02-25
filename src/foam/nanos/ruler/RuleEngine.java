/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.ruler;

import foam.core.ContextAgent;
import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.pool.FixedThreadPool;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

public class RuleEngine extends ContextAwareSupport {
  private DAO delegate_ = null;
  private AtomicBoolean stops_ = new AtomicBoolean(false);

  public RuleEngine(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  public DAO getDelegate() {
    return delegate_;
  }

  public void setDelegate(DAO delegate) {
    this.delegate_ = delegate;
  }

  /**
   * Executes rules by applying their actions synchronously then submitting
   * a chain of their async actions to thread pool for execution.
   *
   * Each rule would check object applicability before applying action.
   *
   * @param rules - Rules to be considered applying
   * @param obj - FObject supplied to rules for execution
   * @param oldObj - Old FObject supplied to rules for execution
   */
  public void execute(List<Rule> rules, FObject obj, FObject oldObj) {
    for (Rule rule : rules) {
      if ( stops_.get() ) return;

      if ( rule.f(getX(), obj, oldObj) ) {
        rule.apply(getX(), obj, oldObj, this);
      }
    }
    asyncApplyRules(rules, obj, oldObj);
  }

  /**
   * Stops the execution of rules.
   */
  public void stop() {
    stops_.set(true);
  }

  private void asyncApplyRules(List<Rule> rules, FObject obj, FObject oldObj) {
    ((FixedThreadPool) getX().get("threadPool")).submit(getX(), new ContextAgent() {
      @Override
      public void execute(X x) {
        for (Rule rule : rules) {
          if ( stops_.get() ) return;

          if ( rule.f(getX(), obj, oldObj) ) {
            rule.asyncApply(getX(), obj, oldObj, RuleEngine.this);
          }
        }
      }
    });
  }
}
