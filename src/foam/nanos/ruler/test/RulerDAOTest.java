package foam.nanos.ruler.test;


import foam.core.ContextAwareAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import foam.nanos.ruler.*;
import foam.nanos.test.Test;
import foam.test.TestUtils;

import java.util.List;

import static foam.mlang.MLang.*;

public class RulerDAOTest extends Test {
  Rule rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9, rule10;
  User user1, user2;
  DAO ruleDAO, userDAO, ruleHistoryDAO,rgDAO;
  int asyncWait = 1000;

  public void runTest(X x) {
    x = TestUtils.mockDAO(x, "ruleDAO");
    x = TestUtils.mockDAO(x, "localUserDAO");
    x = TestUtils.mockDAO(x, "ruleHistoryDAO");

    ruleDAO = (DAO) x.get("ruleDAO");
    userDAO = new RulerDAO(x, (DAO) x.get("localUserDAO"), "localUserDAO");
    ruleHistoryDAO = (DAO) x.get("ruleHistoryDAO");
    RuleGroup rg = new RuleGroup();
    rg.setId("users:email filter");
    rgDAO = ((DAO) (x.get("ruleGroupDAO")));
    rgDAO.put(rg);
    RuleGroup rg2 = new RuleGroup();
    rg2.setId("users:change lastName");
    rgDAO.put(rg2);
    createRule(x);
    testUsers(x);
    testRuleHistory(x);
    testUpdatedRule(x);
    removeData(x);
    testCompositeRuleAction(x);
    removeData(x);
  }

  public void testUsers(X x) {
    user1 = new User();
    user1.setId(10);
    user1.setFirstName("Kristina");
    user1.setEmail("nanos@nanos.net");
    user1 = (User) userDAO.put_(x, user1).fclone();
    test(user1 instanceof User, "No exception thrown: first rule prevented execution of the rule 3, and rule 7 with erroneous predicate is not executed.");
    //test
    test(user1.getEmail().equals("foam@nanos.net"), "RulerDAO changes the email for passed user object");
    test(user1.getLastName().equals("Smirnova"), "the last rule updated user's last name");
    user1.setEmail("nanos@nanos.net");
    user1 = (User) userDAO.put_(x, user1);
    test(user1.getEmail().equals("nanos@nanos.net"), "user's email is nanos@nanos.net: on object update 'create' rules are not executed");
    test(user1.getLastName().equals("Unknown"), "user's lastName is 'Unknown': update rule was executed");
    test(user1.getEmailVerified(), "Set emailVerified to true in rule 9");
    Rule executeRule = (Rule) ruleDAO.find("executeRule");
    test(executeRule != null, "Test rule from executor was added successfully");
    test(executeRule.getRuleGroup().equals("fake test group"), "Test rule's group name is fake test group.");

    // wait for async
    try {
      Thread.sleep(asyncWait + 100);
    } catch (InterruptedException e) { }
    user1 = (User) userDAO.find(user1.getId());
    test(user1.getLastName().equals("Smith"), "user's lastName is 'Smith': async update rule was executed");
  }

  public void testRuleHistory(X x) {
    user2 = new User();
    user2.setId(11);
    user2.setEmail("user2@nanos.net");
    user2 = (User) userDAO.put_(x, user2).fclone();
    user2.setLastName("Smith");
    user2 = (User) userDAO.put_(x, user2);
    // test
    List list = ((ArraySink) ruleHistoryDAO.select(new ArraySink())).getArray();
    RuleHistory ruleHistory = (RuleHistory) list.get(0);
    test(list.size() == 1 && ruleHistory.getResult().equals("Pending"),
      "Create rule history with result = Pending in rule 6 action"
    );

    // wait for async
    try {
      Thread.sleep(asyncWait + 100);
    } catch (InterruptedException e) { }
    ruleHistory = (RuleHistory) ruleHistoryDAO.find(ruleHistory.getId());
    test(ruleHistory.getResult().equals("Done"),
      "Expected: Update rule history result = Done in rule 6 async action. Actual: " + ruleHistory.getResult()
    );
  }

  public void testCompositeRuleAction(X x){
    rule10 = (Rule) rule2.fclone();
    rule10.setId("rule10. composite rule action");
    //test null array of rule actions
    CompositeRuleAction compositeAction = new CompositeRuleAction();
    Predicate pred10 = EQ(DOT(NEW_OBJ, foam.nanos.auth.User.EMAIL), "nanos@nanos.net");
    rule10.setPredicate(pred10);
    rule10.setOperation(Operations.CREATE_OR_UPDATE);

    // test array of 1 action
    RuleAction[] actions = new RuleAction[1];
    RuleAction r1 = (x12, obj, oldObj, ruler, rule10, agent) -> {
      User user = (User) obj;
      user.setEmail("action1"+user.getEmail());
    };
    actions[0] = r1;
    compositeAction.setRuleActions(actions);
    rule10.setAction(compositeAction);
    ruleDAO.put(rule10);
    user1.setEmail("nanos@nanos.net");
    user1 = (User) userDAO.put_(x, user1).fclone();
    test(user1.getEmail().equals("action1nanos@nanos.net"), "one rule action changed user email as expected: "+ user1.getEmail());

    //test array of 2 actions
    actions = new RuleAction[2];
    actions[0] = r1;
    actions[1] = (x12, obj, oldObj, ruler, rule10, agent) -> {
      User user = (User) obj;
      user.setEmail("action2"+user.getEmail());
    };
    compositeAction.setRuleActions(actions);
    rule10.setAction(compositeAction);
    ruleDAO.put(rule10);
    user1.setEmail("nanos@nanos.net");
    user1 = (User) userDAO.put_(x, user1).fclone();
    test(user1.getEmail().equals("action2action1nanos@nanos.net"), "Both rule actions changed user email as expected: "+user1.getEmail());
  }

  public void testUpdatedRule(X x) {

    //the rule with the highest priority in "users:email filter" group and stops execution of the rest.
    rule7 = new Rule();
    rule7.setId("rule7. userDAO email filter");
    rule7.setRuleGroup("users:email filter");
    rule7.setDaoKey("localUserDAO");
    rule7.setOperation(Operations.CREATE);
    rule7.setAfter(false);
    rule7.setPriority(100);
    RuleAction action7 = (x1, obj, oldObj, ruler, rule7, agent) -> ruler.stop();
    rule7.setAction(action7);
    rule7 = (Rule) ruleDAO.put_(x, rule7);

    user1 = new User();
    user1.setId(12);
    user1.setFirstName("Kristina");
    user1.setLastName("Smir");
    user1.setEmail("nanos@nanos.net");
    user1 = (User) userDAO.put_(x, user1).fclone();
    test(user1.getEmail().equals("nanos@nanos.net"), "new rule stops execution of others within `userDAO email filter` group. " +
    " Email is not upated");
    test(user1.getLastName().equals("Smirnova"), "Last name was updated based on the rule4 from a different group");

    ruleDAO.remove_(x, rule4);
    ruleDAO.remove_(x, rule5);

    user1.setLastName("foam");
    user1 = (User) userDAO.put_(x, user1).fclone();
    test(user1.getLastName().equals("foam"), "Last name is not updated after rules were removed");
  }

  public void createRule(X x) {
    // first rule stops execution of rules with a lower priority within the same group
    rule1 = new Rule();
    rule1.setId("rule1. userDAO email filter");
    rule1.setRuleGroup("users:email filter");
    rule1.setDaoKey("localUserDAO");
    rule1.setOperation(Operations.CREATE);
    rule1.setAfter(false);
    rule1.setPriority(60);
    RuleAction action1 = (x1, obj, oldObj, ruler, rule1, agent) -> ruler.stop();
    rule1.setAction(action1);
    rule1 = (Rule) ruleDAO.put_(x, rule1);

    //the rule has a higher priority than the first rule, changes user's email from nanos@nanos.net to foam@nanos.net
    rule2 = new Rule();
    rule2.setId("rule2. userDAO email filter");
    rule2.setRuleGroup("users:email filter");
    rule2.setDaoKey("localUserDAO");
    rule2.setOperation(Operations.CREATE);
    rule2.setAfter(false);
    rule2.setPriority(80);
    Predicate predicate2 = AND(
      EQ(DOT(NEW_OBJ, foam.nanos.auth.User.EMAIL), "nanos@nanos.net"),
      EQ(DOT(NEW_OBJ, INSTANCE_OF(foam.nanos.auth.User.class)), true)
    );
    rule2.setPredicate(predicate2);
    RuleAction action2 = (x12, obj, oldObj, ruler, rule2, agent) -> {
      User user = (User) obj;
      user.setEmail("foam@nanos.net");
    };
    rule2.setAction(action2);
    RuleAction asyncAction2 = (x13, obj, oldObj, ruler, rule2, agent) -> {
      throw new RuntimeException("this async action is not supposed to be executed.");
    };
    rule2.setAsyncAction(asyncAction2);
    rule2 = (Rule) ruleDAO.put_(x, rule2);

    //the rule has lower priority than the first one => should never be executed
    rule3 = new Rule();
    rule3.setId("rule3. userDAO email filter");
    rule3.setRuleGroup("users:email filter");
    rule3.setDaoKey("localUserDAO");
    rule3.setOperation(Operations.CREATE);
    rule3.setAfter(false);
    rule3.setPriority(20);
    RuleAction action3 = (x14, obj, oldObj, ruler, rule3, agent) -> {
      throw new RuntimeException("this rule is not supposed to be executed");
    };
    rule3.setAction(action3);
    rule3 = (Rule) ruleDAO.put_(x, rule3);

    //the rule has lower priority than the first one but has different group so should be executed
    rule4 = new Rule();
    rule4.setId("rule4. userDAO lastName filter");
    rule4.setRuleGroup("users:change lastName");
    rule4.setDaoKey("localUserDAO");
    rule4.setOperation(Operations.CREATE);
    rule4.setAfter(false);
    rule4.setPriority(10);
    Predicate predicate4 = EQ(DOT(NEW_OBJ, INSTANCE_OF(foam.nanos.auth.User.class)), true);
    rule4.setPredicate(predicate4);
    RuleAction action4 = (x15, obj, oldObj, ruler, rule4, agent) -> {
      User user = (User) obj;
      user.setLastName("Smirnova");
    };
    rule4.setAction(action4);
    RuleAction asyncAction4 = (x16, obj, oldObj, ruler, rule4, agent) -> ruler.stop();
    rule4.setAsyncAction(asyncAction4);
    rule4 = (Rule) ruleDAO.put_(x, rule4);

    //the rule has lower priority than the first one but has different group so should be executed
    rule5 = new Rule();
    rule5.setId("rule5. userDAO lastName filter");
    rule5.setRuleGroup("users:change lastName");
    rule5.setDaoKey("localUserDAO");
    rule5.setOperation(Operations.UPDATE);
    rule5.setAfter(false);
    Predicate predicate5 = EQ(DOT(NEW_OBJ, INSTANCE_OF(foam.nanos.auth.User.class)), true);
    rule5.setPredicate(predicate5);
    RuleAction action5 = (x17, obj, oldObj, ruler, rule5, agency) -> {
      User user = (User) obj;
      user.setLastName("Unknown");
      Rule executeRule = new Rule();
      executeRule.setId("executeRule");
      RuleGroup rg = new RuleGroup();
      rg.setId("fake test group");
      rgDAO.put(rg);
      executeRule.setRuleGroup("fake test group");
      executeRule.setDaoKey("fakeDaoKey");
      agency.submit(x, new ContextAwareAgent() {
        @Override
        public void execute(X x) {
          ruleDAO.put(executeRule);
        }
      }, "RulerDAOTest add fake rule");

    };
    rule5.setAction(action5);
    RuleAction asyncAction5 = (x18, obj, oldObj, ruler, rule5, agent) -> {
      // simulate async
      try {
        Thread.sleep(asyncWait);
      } catch (InterruptedException e) { }

      User user = (User) obj;
      user.setLastName("Smith");
    };
    rule5.setAsyncAction(asyncAction5);
    rule5 = (Rule) ruleDAO.put_(x, rule5);

    //the rule only applied to user2
    rule6 = new Rule();
    RuleGroup rg = new RuleGroup();
    rg.setId("user2 update");
    rgDAO.put(rg);
    rule6.setId("rule6. user2 update");
    rule6.setRuleGroup("user2 update");
    rule6.setDaoKey("localUserDAO");
    rule6.setOperation(Operations.UPDATE);
    rule6.setSaveHistory(true);
    rule6.setPredicate(EQ(DOT(NEW_OBJ, foam.nanos.auth.User.EMAIL), "user2@nanos.net"));
    RuleAction action6 = (x19, obj, oldObj, ruler, rule6, agent) -> ruler.putResult("Pending");
    rule6.setAction(action6);
    RuleAction asyncAction6 = (x110, obj, oldObj, ruler, rule6, agent) -> {
      // simulate async
      try {
        Thread.sleep(asyncWait);
      } catch (InterruptedException e) { }

      ruler.putResult("Done");
    };
    rule6.setAsyncAction(asyncAction6);
    rule6 = (Rule) ruleDAO.put_(x, rule6);

    //the rule with erroneous predicate
    rule8 = new Rule();
    rule8.setId("rule8. Erroneous rule predicate");
    RuleGroup rg2 = new RuleGroup();
    rg2.setId("user created");
    rgDAO.put(rg2);
    rule8.setRuleGroup("user created");
    rule8.setDaoKey("localUserDAO");
    rule8.setOperation(Operations.CREATE);
    rule8.setAfter(false);
    rule8.setPredicate(new DummyErroneousPredicate());
    RuleAction action8 = (x111, obj, oldObj, ruler, rule8, agent) -> ruler.stop();
    rule8.setAction(action8);
    rule8 = (Rule) ruleDAO.put_(x, rule8);

    //the rule with FObject predicate
    rule9 = new Rule();
    rule9.setId("rule9. FObject rule predicate");
    RuleGroup rg3 = new RuleGroup();
    rg3.setId("user updated");
    rgDAO.put(rg3);
    rule9.setRuleGroup("user updated");
    rule9.setDaoKey("localUserDAO");
    rule9.setOperation(Operations.UPDATE);
    rule9.setAfter(false);
    rule9.setPredicate(EQ(foam.nanos.auth.User.EMAIL, "nanos@nanos.net"));
    RuleAction action9 = (x113, obj, oldObj, ruler, rule9, agent) -> {
      User user = (User) obj;
      user.setEmailVerified(true);
    };
    rule9.setAction(action9);
    rule9 = (Rule) ruleDAO.put_(x, rule9);
  }
  public void removeData(X x) {
    ruleDAO.remove_(x, rule1);
    ruleDAO.remove_(x, rule2);
    ruleDAO.remove_(x, rule3);
    ruleDAO.remove_(x, rule6);
    ruleDAO.remove_(x, rule7);
    ruleDAO.remove_(x, rule8);
    ruleDAO.remove_(x, rule9);
    ruleDAO.remove_(x, rule10);
    userDAO.remove_(x, user1);
    userDAO.remove_(x, user2);
  }
}
