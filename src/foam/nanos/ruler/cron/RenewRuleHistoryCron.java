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
          // Execute the associated rule via rule engine.
          // The rule engine's arguments:
          //   - delegate : DAO looked up using RuleHistory.objectDaoKey
          //   - rule     : The rule to be executed
          //   - obj      : null - as object is not being put
          //   - oldObj   : The object retrieved from the DAO using RuleHistory.objectId
          Rule rule = (Rule) ruleDAO.find(ruleHistory.getRuleId());
          if ( rule == null ) {
            throw new Exception(
              String.format("Rule with id %d is not found.",
                ruleHistory.getId()));
          }
          DAO delegate = (DAO) x.get(ruleHistory.getObjectDaoKey());
          FObject oldObj = delegate.find(ruleHistory.getObjectId());
          if ( oldObj == null ) {
            throw new Exception(
              String.format("Object with id %d in %s is not found.",
                ruleHistory.getId(),
                ruleHistory.getObjectDaoKey()));
          }
          new RuleEngine(x, delegate).execute(
            Arrays.asList(rule), null, oldObj);
          ruleHistory.setStatus(RuleHistoryStatus.SUCCESS);
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
