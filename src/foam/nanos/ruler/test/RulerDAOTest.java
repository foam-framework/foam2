package foam.nanos.ruler.test;

import foam.core.FObject;
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
  Rule rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8;
  User user1, user2;
  DAO ruleDAO, userDAO, ruleHistoryDAO;
  int asyncWait = 1000;

  public void runTest(X x) {
    x = TestUtils.mockDAO(x, "ruleDAO");
    x = TestUtils.mockDAO(x, "localUserDAO");
    x = TestUtils.mockDAO(x, "ruleHistoryDAO");

    ruleDAO = (DAO) x.get("ruleDAO");
    userDAO = new RulerDAO(x, (DAO) x.get("localUserDAO"), "localUserDAO");
    ruleHistoryDAO = (DAO) x.get("ruleHistoryDAO");
    createRule(x);
    testUsers(x);
    testRuleHistory(x);
    testUpdatedRule(x);
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
      "Update rule history result = Done in rule 6 async action"
    );
  }

  public void testUpdatedRule(X x) {

    //the rule with the highest priority in "users:email filter" group and stops execution of the rest.
    rule7 = new Rule();
    rule7.setId(7);
    rule7.setName("userDAO email filter");
    rule7.setRuleGroup("users:email filter");
    rule7.setDaoKey("localUserDAO");
    rule7.setOperation(Operations.CREATE);
    rule7.setAfter(false);
    rule7.setPriority(100);
    RuleAction action7 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        ruler.stop();
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
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
    rule1.setId(1);
    rule1.setName("userDAO email filter");
    rule1.setRuleGroup("users:email filter");
    rule1.setDaoKey("localUserDAO");
    rule1.setOperation(Operations.CREATE);
    rule1.setAfter(false);
    rule1.setPriority(60);
    RuleAction action1 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        ruler.stop();
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
    rule1.setAction(action1);
    rule1 = (Rule) ruleDAO.put_(x, rule1);

    //the rule has a higher priority than the first rule, changes user's email from nanos@nanos.net to foam@nanos.net
    rule2 = new Rule();
    rule2.setId(2);
    rule2.setName("userDAO email filter");
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
    RuleAction action2 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        User user = (User) obj;
        user.setEmail("foam@nanos.net");
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
    rule2.setAction(action2);
    RuleAction asyncAction2 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        throw new RuntimeException("this async action is not supposed to be executed.");
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
    rule2.setAsyncAction(asyncAction2);
    rule2 = (Rule) ruleDAO.put_(x, rule2);

    //the rule has lower priority than the first one => should never be executed
    rule3 = new Rule();
    rule3.setId(3);
    rule3.setName("userDAO email filter");
    rule3.setRuleGroup("users:email filter");
    rule3.setDaoKey("localUserDAO");
    rule3.setOperation(Operations.CREATE);
    rule3.setAfter(false);
    rule3.setPriority(20);
    RuleAction action3 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        throw new RuntimeException("this rule is not supposed to be executed");
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
    rule3.setAction(action3);
    rule3 = (Rule) ruleDAO.put_(x, rule3);

    //the rule has lower priority than the first one but has different group so should be executed
    rule4 = new Rule();
    rule4.setId(4);
    rule4.setName("userDAO lastName filter");
    rule4.setRuleGroup("users:change lastName");
    rule4.setDaoKey("localUserDAO");
    rule4.setOperation(Operations.CREATE);
    rule4.setAfter(false);
    rule4.setPriority(10);
    Predicate predicate4 = EQ(DOT(NEW_OBJ, INSTANCE_OF(foam.nanos.auth.User.class)), true);
    rule4.setPredicate(predicate4);
    RuleAction action4 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        User user = (User) obj;
        user.setLastName("Smirnova");
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
    rule4.setAction(action4);
    RuleAction asyncAction4 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        ruler.stop();
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
    rule4.setAsyncAction(asyncAction4);
    rule4 = (Rule) ruleDAO.put_(x, rule4);

    //the rule has lower priority than the first one but has different group so should be executed
    rule5 = new Rule();
    rule5.setId(5);
    rule5.setName("userDAO lastName filter");
    rule5.setRuleGroup("users:change lastName");
    rule5.setDaoKey("localUserDAO");
    rule5.setOperation(Operations.UPDATE);
    rule5.setAfter(false);
    Predicate predicate5 = EQ(DOT(NEW_OBJ, INSTANCE_OF(foam.nanos.auth.User.class)), true);
    rule5.setPredicate(predicate5);
    RuleAction action5 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        User user = (User) obj;
        user.setLastName("Unknown");
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
    rule5.setAction(action5);
    RuleAction asyncAction5 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        // simulate async
        try {
          Thread.sleep(asyncWait);
        } catch (InterruptedException e) { }

        User user = (User) obj;
        user.setLastName("Smith");
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
    rule5.setAsyncAction(asyncAction5);
    rule5 = (Rule) ruleDAO.put_(x, rule5);

    //the rule only applied to user2
    rule6 = new Rule();
    rule6.setId(6);
    rule6.setName("user2 update");
    rule6.setRuleGroup("user2 update");
    rule6.setDaoKey("localUserDAO");
    rule6.setOperation(Operations.UPDATE);
    rule6.setSaveHistory(true);
    rule6.setPredicate(EQ(DOT(NEW_OBJ, foam.nanos.auth.User.EMAIL), "user2@nanos.net"));
    RuleAction action6 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        ruler.putResult("Pending");
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
    rule6.setAction(action6);
    RuleAction asyncAction6 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        // simulate async
        try {
          Thread.sleep(asyncWait);
        } catch (InterruptedException e) { }

        ruler.putResult("Done");
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
    rule6.setAsyncAction(asyncAction6);
    rule6 = (Rule) ruleDAO.put_(x, rule6);

    //the rule with erroneous predicate
    rule8 = new Rule();
    rule8.setId(8);
    rule8.setName("Erroneous rule predicate");
    rule8.setRuleGroup("user created");
    rule8.setDaoKey("localUserDAO");
    rule8.setOperation(Operations.CREATE);
    rule8.setAfter(false);
    rule8.setPredicate(new DummyErroneousPredicate());
    RuleAction action8 = new RuleAction() {
      @Override
      public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        ruler.stop();
      }

      @Override
      public void applyReverseAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {

      }

      @Override
      public boolean canExecute(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
        return true;
      }

      @Override
      public String describe() {
        return "";
      }
    };
    rule8.setAction(action8);
    rule8 = (Rule) ruleDAO.put_(x, rule8);
  }
  public void removeData(X x) {
    ruleDAO.remove_(x, rule1);
    ruleDAO.remove_(x, rule2);
    ruleDAO.remove_(x, rule3);
    ruleDAO.remove_(x, rule6);
    ruleDAO.remove_(x, rule7);
    ruleDAO.remove_(x, rule8);
    userDAO.remove_(x, user1);
    userDAO.remove_(x, user2);
  }
}
