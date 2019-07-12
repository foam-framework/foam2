/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.ruler;

import foam.core.*;
import foam.dao.DAO;
import foam.nanos.auth.LastModifiedAware;
import foam.nanos.auth.LastModifiedByAware;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import foam.nanos.pool.FixedThreadPool;

import java.lang.Exception;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class RuleEngine extends ContextAwareSupport {
  private DAO delegate_ = null;
  private DAO ruleHistoryDAO_ = null;
  private AtomicBoolean stops_ = new AtomicBoolean(false);
  private Map<Long, Object> results_ = new HashMap<>();
  private Map<Long, RuleHistory> savedRuleHistory_ = new HashMap<>();
  private Rule currentRule_ = null;
  private X userX_;

  public RuleEngine(X x, X systemX, DAO delegate) {
    setX(systemX);
    setDelegate(delegate);
    ruleHistoryDAO_ = (DAO) x.get("ruleHistoryDAO");
    userX_ = x;
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
    CompoundContextAgency compoundAgency = new CompoundContextAgency();
    ContextualizingAgency agency = new ContextualizingAgency(compoundAgency, userX_, getX());
    for (Rule rule : rules) {
      if ( stops_.get() ) break;
      if ( ! isRuleApplicable(rule, obj, oldObj)) continue;
      PM pm = new PM();
      pm.setClassType(RulerDAO.getOwnClassInfo());
      pm.setName(rule.getDaoKey() + ": " + rule.getName());
      pm.init_();
      applyRule(rule, obj, oldObj, agency);
      pm.log(x_);
      agency.submit(x_, x -> saveHistory(rule, obj));
    }
    try {
      compoundAgency.execute(x_);
    } catch (Exception e) {
      Logger logger = (Logger) x_.get("logger");
      logger.error(e.getMessage());
    }

    asyncApplyRules(rules, obj, oldObj);
  }

  /**
   * Probes rules execution by applying actions and skipping
   * execution of agents that contain code that effects the system
   *
   * @param rules - Rules to be considered applying
   * @param obj - FObject supplied to rules for execution
   * @param rulerProbe -
   * @param oldObj - Old FObject supplied to rules for execution
   */
  public void probe(List<Rule> rules, RulerProbe rulerProbe, FObject obj, FObject oldObj) {
    PM pm = new PM();
      pm.setClassType(RulerProbe.getOwnClassInfo());
      pm.setName("Probe:" + obj.getClassInfo());
      pm.init_();
    for (Rule rule : rules) {
      if ( ! isRuleApplicable(rule, obj, oldObj) ) {
        continue;
      }
      TestedRule agent = new TestedRule();
      agent.setRule(rule.getId());
      if ( stops_.get() ) {
        agent.setMessage("Not executed because was overridden and forced to stop.");
        agent.setPassed(false);
        rulerProbe.getAppliedRules().add(agent);
        continue;
      }
      try {
        applyRule(rule, obj, oldObj, agent);
        agent.setMessage("Successfully applied");
      } catch (Exception e ) {
        agent.setPassed(false);
        agent.setMessage(e.getMessage());
      }
      rulerProbe.getAppliedRules().add(agent);
    }
    for (Rule rule : rules) {
      if ( rule.getAsyncAction() != null && rule.f(x_, obj, oldObj) ) {
        TestedRule asyncAgent = new TestedRule();
        asyncAgent.setRule(rule.getId());
        asyncAgent.setMessage("AsyncAction.");
        rulerProbe.appliedRules_.add(asyncAgent);
      }
    }
    pm.log(x_);
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

  private void applyRule(Rule rule, FObject obj, FObject oldObj, Agency agency) {
    ProxyX readOnlyX = new ReadOnlyDAOContext(userX_);
    rule.apply(readOnlyX, obj, oldObj, this, agency);
  }

  private boolean isRuleApplicable(Rule rule, FObject obj, FObject oldObj) {
    currentRule_ = rule;
    return rule.getAction() != null
      && rule.f(userX_, obj, oldObj);
  }

  private void asyncApplyRules(List<Rule> rules, FObject obj, FObject oldObj) {
    ((FixedThreadPool) getX().get("threadPool")).submit(userX_, x -> {
      for (Rule rule : rules) {
        if ( stops_.get() ) return;

        currentRule_ = rule;
        if ( rule.getAsyncAction() != null
          && rule.f(x, obj, oldObj)
        ) {
          // We assume `obj` staleness on after rules. For that, greedy algorithm
          // is used when reloading object for the after rules. On the other hand,
          // non-greedy algorithm is used for before rules hence changes on obj
          // will be carried over to the reloaded object.
          FObject nu = reloadObject(x, obj, oldObj, rule.getAfter());
          try {
            rule.asyncApply(x, nu, oldObj, RuleEngine.this);
            saveHistory(rule, nu);
          } catch (Exception ex) {
            retryAsyncApply(x, rule, nu, oldObj);
          }
        }
      }
    });
  }

  private void retryAsyncApply(X x, Rule rule, FObject obj, FObject oldObj) {
    new RetryManager().submit(x, x1 -> {
      rule.asyncApply(getX(), obj, oldObj, RuleEngine.this);
      saveHistory(rule, obj);
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
    if ( rule.getValidity() > 0 ) {
      Duration validity = Duration.ofDays(rule.getValidity());
      Date expirationDate = Date.from(Instant.now().plus(validity));
      record.setExpirationDate(expirationDate);
      record.setStatus(RuleHistoryStatus.SCHEDULED);
    }

    savedRuleHistory_.put(rule.getId(),
      (RuleHistory) ruleHistoryDAO_.put(record).fclone());
  }

  private FObject reloadObject(X x, FObject obj, FObject oldObj, boolean greedy) {
    FObject nu = getDelegate().find_(x, obj);
    if ( nu == null ) {
      return obj;
    }

    FObject old = oldObj;
    if ( old == null ) {
      try {
        old = obj.getClass().newInstance();
      } catch (Exception e) {
        // Object instantiation should not fail but if it does fail
        // return obj without reloading.
        return obj;
      }
    }

    old = old.fclone();
    FObject cloned = obj.fclone();

    // Update lastModified and lastModifiedBy of old and cloned objects so that
    // equality comparisons would not be skewed by these properties.
    if ( obj instanceof LastModifiedAware ) {
      Date lastModified = ((LastModifiedAware) nu).getLastModified();
      ((LastModifiedAware) cloned).setLastModified(lastModified);
      ((LastModifiedAware) old).setLastModified(lastModified);
    }
    if ( obj instanceof LastModifiedByAware ) {
      long lastModifiedBy = ((LastModifiedByAware) nu).getLastModifiedBy();
      ((LastModifiedByAware) cloned).setLastModifiedBy(lastModifiedBy);
      ((LastModifiedByAware) old).setLastModifiedBy(lastModifiedBy);
    }

    // Return obj if nu == old or nu == obj.
    if ( nu.equals(old) || nu.equals(cloned) ) {
      return obj;
    }

    // For greedy algorithm, return the reloaded object (nu) as is. Otherwise,
    // override the reloaded object with the changes from the original object (obj).
    return greedy ? nu : nu.copyFrom(obj);
  }
}
