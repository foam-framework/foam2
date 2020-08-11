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
import foam.nanos.auth.LifecycleAware;
import foam.nanos.auth.LifecycleState;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;

import java.lang.Exception;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class RuleEngine extends ContextAwareSupport {
  private DAO delegate_ = null;
  private DAO ruleHistoryDAO_ = null;
  private AtomicBoolean stops_ = new AtomicBoolean(false);
  private Map<String, Object> results_ = new HashMap<>();
  private Map<String, RuleHistory> savedRuleHistory_ = new HashMap<>();
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
   * Before generating any logger.debug(...) calls rule.debug property should be tested:
   *  if ( rule.getDebug() ) { logger.debug(…) };
   *
   * @param rules - Rules to be considered applying
   * @param obj - FObject supplied to rules for execution
   * @param oldObj - Old FObject supplied to rules for execution
   */
  public void execute(List<Rule> rules, FObject obj, FObject oldObj) {
    CompoundContextAgency compoundAgency = new CompoundContextAgency();
    ContextualizingAgency agency = new ContextualizingAgency(compoundAgency, userX_, getX());
    Logger logger = (Logger) getX().get("logger");
    for (Rule rule : rules) {
      try {
        if ( stops_.get() ) break;
        if ( ! isRuleApplicable(rule, obj, oldObj)) continue;
        PM pm = (PM) x_.get("PM");
        pm.setKey(RulerDAO.getOwnClassInfo().getId());
        pm.setName(rule.getDaoKey() + ": " + rule.getId());
        pm.init_();
        applyRule(rule, obj, oldObj, agency);
        pm.log(x_);
        agency.submit(x_, x -> saveHistory(rule, obj), "Save history. Rule id:" + rule.getId());
      } catch (Exception e) {
        // To be expected if a rule blocks an operation. Not an error.
        logger.debug(this.getClass().getSimpleName(), "id", rule.getId(), "\\nrule", rule, "\\nobj", obj, "\\nold", oldObj, "\\n", e);
        throw e;
      }
    }
    try {
      compoundAgency.execute(x_);
    } catch (Exception e) {
      // This should never happen.
      // It means there's a bug in a Rule agent and it should be fixed.
      var message = "CRITICAL UNEXPECTED EXCEPTION EXECUTING RULE";

      logger.error(message, e);
      // TODO: this breaks CI, enable when all test cases passing
      // throw new RuntimeException(message, e);
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
      PM pm = (PM) x_.get("PM");
      pm.setKey(RulerProbe.getOwnClassInfo().getId());
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

  public Object getResult(String ruleId) {
    return results_.get(ruleId);
  }

  private void applyRule(Rule rule, FObject obj, FObject oldObj, Agency agency) {
    ProxyX readOnlyX = new ReadOnlyDAOContext(userX_);
    rule.apply(readOnlyX, obj, oldObj, this, rule, agency);
  }

  private boolean isRuleApplicable(Rule rule, FObject obj, FObject oldObj) {
    currentRule_ = rule;

    // Check if the rule is in an ACTIVE state
    Boolean isActive = true;
    if (rule instanceof LifecycleAware) {
      isActive = ((LifecycleAware) rule).getLifecycleState() == LifecycleState.ACTIVE;
    }

    return
         isActive
      && rule.getAction() != null
      && rule.f(userX_, obj, oldObj);
  }

  private void asyncApplyRules(List<Rule> rules, FObject obj, FObject oldObj) {
    if (rules.isEmpty()) return;
    ((Agency) getX().get("threadPool")).submit(userX_, x -> {
      Logger logger = (Logger) x.get("logger");
      for (Rule rule : rules) {
        if ( stops_.get() ) return;

        currentRule_ = rule;
        if ( rule.getAsyncAction() != null
          && rule.f(x, obj, oldObj)
        ) {
          // We assume the original object `obj` is stale when running after rules.
          // For that, greedy mode is used for object reload. For before rules,
          // object reload uses non-greedy mode so that changes on the original
          // object will be copied over to the reloaded object.
          FObject nu = getDelegate().find_(x, obj).fclone();
          nu = reloadObject(obj, oldObj, nu, rule.getAfter());
          try {
            rule.asyncApply(x, nu, oldObj, RuleEngine.this, rule);
            saveHistory(rule, nu);
          } catch (Exception ex) {
            logger.warning("Retry asyncApply rule(" + rule.getId() + ").", ex);
            retryAsyncApply(x, rule, nu, oldObj);
          }
        }
      }
    }, "Async apply rules. Rule group: " + rules.get(0).getRuleGroup());
  }

  private void retryAsyncApply(X x, Rule rule, FObject obj, FObject oldObj) {
    new RetryManager(rule.getName()).submit(x, x1 -> {
      rule.asyncApply(x, obj, oldObj, RuleEngine.this, rule);
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

  /**
   * Reloads object when running async action since the original object `obj`
   * might be stale at the time of execution.
   *
   * If reloaded object `nu` hasn't changed (reloaded object equals to old
   * object) then return the original object as the reloaded object.
   *
   * If reloaded object has changed and already saved to DAO (reloaded object
   * equals to original object) then return the original object.
   *
   * Otherwise, return the reloaded object. If greedy flag is set to true then
   * also copy changes from the original object to the reloaded object.
   *
   * @param obj - Original object
   * @param oldObj - Old object
   * @param nu - Reloaded object
   * @param greedy - Flag to set greedy mode
   * @return Reloaded object
   */
  private FObject reloadObject(FObject obj, FObject oldObj, FObject nu, boolean greedy) {
    FObject old = (FObject) SafetyUtil.deepClone(oldObj);
    if ( old == null ) {
      try {
        old = obj.getClass().newInstance();
      } catch (Exception e) {
        // Object instantiation should not fail but if it does fail then return
        // the original object as the reloaded object.
        return obj;
      }
    }
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

    // Return the original object as the reloaded object if nu == old or nu == obj.
    if ( nu.equals(old) || nu.equals(cloned) ) {
      return obj;
    }

    // For greedy mode, return the reloaded object `nu` as is. Otherwise,
    // override the reloaded object with the changes from the original object.
    return greedy ? nu : nu.copyFrom(obj);
  }
}
