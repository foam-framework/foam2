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
import foam.nanos.boot.NSpec;
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
  private Map<Long, RuleHistory> ruleHistorySaved_ = new HashMap<>();

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
    for (Rule rule : rules) {
      if ( stops_.get() ) return;

      if ( rule.f(getX(), obj, oldObj) ) {
        rule.apply(getX(), obj, oldObj, this);
        saveHistory(rule, obj);
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

  /**
   * Store result of rule execution
   * @param result
   */
  public void putResult(long key, Object result) {
    results_.put(key, result);
  }

  public Object getResult(long key) {
    return results_.get(key);
  }

  private void asyncApplyRules(List<Rule> rules, FObject obj, FObject oldObj) {
    ((FixedThreadPool) getX().get("threadPool")).submit(getX(), new ContextAgent() {
      @Override
      public void execute(X x) {
        for (Rule rule : rules) {
          if ( stops_.get() ) return;

          if ( rule.f(getX(), obj, oldObj) ) {
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

    RuleHistory record = ruleHistorySaved_.get(rule.getId());
    if ( record == null ) {
      record = new RuleHistory.Builder(getX())
        .setRuleId(rule.getId())
        .setObjectId(obj.getProperty("id"))
        .setObjectDaoKey((String) getX().get(NSpec.class).getId())
        .build();
    }
    record.setResult(getResult(rule.getId()));
    ruleHistoryDAO_.put(record);
  }
}
