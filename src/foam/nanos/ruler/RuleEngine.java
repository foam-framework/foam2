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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

public class RuleEngine extends ContextAwareSupport {
  private DAO delegate_ = null;
  private DAO ruleHistoryDAO_ = null;
  private AtomicBoolean stops_ = new AtomicBoolean(false);
  private Map<Long, Object> results_ = new HashMap<>();
  private Map<Long, RuleHistory> savedRuleHistory_ = new HashMap<>();
  private Rule currentRule_ = null;

  public RuleEngine(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    ruleHistoryDAO_ = (DAO) x.get("ruleHistoryDAO");
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
    applyRules(rules, obj, oldObj);
    asyncApplyRules(rules, obj, oldObj);
  }

  /**
   * Stops the execution of rules.
   */
  public void stop() {
    stops_.set(true);
  }

  /**
   * Store result of current rule execution
   * @param result
   */
  public void putResult(Object result) {
    results_.put(currentRule_.getId(), result);
  }

  public Object getResult(long ruleId) {
    return results_.get(ruleId);
  }

  private void applyRules(List<Rule> rules, FObject obj, FObject oldObj) {
    for (Rule rule : rules) {
      if ( stops_.get() ) return;

      currentRule_ = rule;
      if ( rule.f(getX(), obj, oldObj)
        && rule.getAction() != null
      ) {
        rule.apply(getX(), obj, oldObj, this);
        saveHistory(rule, obj);
      }
    }
  }

  private void asyncApplyRules(List<Rule> rules, FObject obj, FObject oldObj) {
    ((FixedThreadPool) getX().get("threadPool")).submit(getX(), new ContextAgent() {
      @Override
      public void execute(X x) {
        for (Rule rule : rules) {
          if ( stops_.get() ) return;

          currentRule_ = rule;
          if ( rule.f(getX(), obj, oldObj)
            && rule.getAsyncAction() != null
          ) {
            rule.asyncApply(getX(), obj, oldObj, RuleEngine.this);
            saveHistory(rule, obj);
          }
        }
      }
    });
  }

  private void saveHistory(Rule rule, FObject obj) {
    if ( ! rule.getSaveHistory() ) {
      return;
    }

    RuleHistory record = savedRuleHistory_.get(rule.getId());
    if ( record == null ) {
      record = new RuleHistory.Builder(getX())
        .setRuleId(rule.getId())
        .setObjectId(obj.getProperty("id"))
        .setObjectDaoKey(rule.getDaoKey())
        .build();
    }
    record.setResult(getResult(rule.getId()));
    savedRuleHistory_.put(rule.getId(),
      (RuleHistory) ruleHistoryDAO_.put(record).fclone());
  }
}
