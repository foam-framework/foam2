package foam.nanos.ruler.cron;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.ruler.Rule;
import foam.nanos.ruler.RuleEngine;
import foam.nanos.ruler.RuleHistory;
import foam.nanos.ruler.RuleHistoryStatus;

import java.util.Arrays;
import java.util.Date;

import static foam.mlang.MLang.*;

public class RenewRuleHistoryCron implements ContextAgent {
  @Override
  public void execute(X x) {
    DAO ruleDAO = (DAO) x.get("ruleDAO");
    DAO ruleHistoryDAO = (DAO) x.get("ruleHistoryDAO");

    ruleHistoryDAO.where(
      AND(
        LTE(RuleHistory.EXPIRATION_DATE, new Date()),
        EQ(RuleHistory.STATUS, RuleHistoryStatus.SCHEDULED)
      )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        RuleHistory ruleHistory = (RuleHistory) ((FObject) obj).fclone();
        ruleHistory.setStatus(RuleHistoryStatus.RUNNING);
        ruleHistory = (RuleHistory) ruleHistoryDAO.put(ruleHistory).fclone();

        try {
          Rule rule = (Rule) ruleDAO.find(ruleHistory.getRuleId());
          if ( rule == null ) {
            throw new Exception(
              String.format("Rule with id %d is not found.",
                ruleHistory.getRuleId()));
          }
          DAO delegate = (DAO) x.get(ruleHistory.getObjectDaoKey());
          FObject object = delegate.find(ruleHistory.getObjectId());
          if ( object == null ) {
            throw new Exception(
              String.format("Object with id %d in %s is not found.",
                ruleHistory.getObjectId(),
                ruleHistory.getObjectDaoKey()));
          }

          // Execute the associated rule via rule engine.
          // The rule engine's arguments:
          //   - x        : Context with isScheduledRule=true
          //   - delegate : DAO looked up using RuleHistory.objectDaoKey
          //   - rule     : The rule to be executed
          //   - object   : Uses as both obj and oldObj
          new RuleEngine(x.put("isScheduledRule", true), x, delegate).execute(
            Arrays.asList(rule), object, object);
          ruleHistory.setStatus(RuleHistoryStatus.FINISHED);
        } catch (Throwable t) {
          StringBuilder sb = new StringBuilder();
          sb.append(String.format(
            "RuleHistory with id %d failed to execute", ruleHistory.getId()));

          // Log the error
          Logger logger = (Logger) x.get("logger");
          logger.error(sb.toString() , t);

          // Add note to rule history
          sb.append(" : ").append(t.getMessage());
          ruleHistory.setStatus(RuleHistoryStatus.ERROR);
          ruleHistory.setNote(sb.toString());
        } finally {
          ruleHistoryDAO.put(ruleHistory);
        }
      }
    });
  }
}
