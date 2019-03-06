package foam.nanos.ruler.cron;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.ruler.Rule;
import foam.nanos.ruler.RuleEngine;
import foam.nanos.ruler.RuleHistory;

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
        EQ(RuleHistory.WAS_RENEW, false)
      )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        RuleHistory ruleHistory = (RuleHistory) ((FObject) obj).fclone();
        ruleHistory.setWasRenew(true);
        ruleHistoryDAO.put(ruleHistory);

        // Execute the associated rule via rule engine.
        // The rule engine's arguments:
        //   - delegate : DAO looked up using RuleHistory.objectDaoKey
        //   - rule     : The rule to be executed
        //   - obj      : null - as object is not being put
        //   - oldObj   : The object retrieved from the DAO using RuleHistory.objectId
        Rule rule = (Rule) ruleDAO.find(ruleHistory.getRuleId());
        DAO delegate = (DAO) x.get(ruleHistory.getObjectDaoKey());
        FObject oldObj = delegate.find(ruleHistory.getObjectId());
        new RuleEngine(x, delegate).execute(
          Arrays.asList(rule), null, oldObj);
      }
    });
  }
}
