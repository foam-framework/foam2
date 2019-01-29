package foam.nanos.ruler;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import foam.nanos.test.Test;


public class RulerDAOTest extends Test {
  Rule rule1, rule2, rule3, rule4, rule5;
  User user;
  DAO ruleDAO, userDAO;

  public void runTest(X x) {
    ruleDAO = ((DAO) x.get("ruleDAO"));
    createRule(x);
    userDAO = new RulerDAO(x, (DAO)x.get("localUserDAO"), "localUserDAO");
    x = x.put(userDAO, "localUserDAO");
    testUsers(x);
    removeData(x);
  }

  public void testUsers(X x) {
    user = new User();
    user.setFirstName("Kristina");
    user.setEmail("nanos@nanos.net");
    user = (User) userDAO.put_(x, user).fclone();
    test(user instanceof User, "No exception thrown: first rule prevented execution of the rule 3");
    //test
    test(user.getEmail().equals("foam@nanos.net"), "RuleDAO changes the email for passed user object");
    test(user.getLastName().equals("Smirnova"), "the last rule updated user's last name");
    user.setEmail("nanos@nanos.net");
    user = (User) userDAO.put_(x, user);
    test(user.getEmail().equals("nanos@nanos.net"), "user's email is nanos@nanos.net: on object update 'create' rules are not executed");
    test(user.getLastName().equals("Unknown"), "user's lastName is 'Unknown': update rule was executed");
  }

  public void createRule(X x) {
    // first rule stops execution of rules with a lower priority within the same group
    rule1 = new Rule();
    rule1.setName("userDAO email filter");
    rule1.setRuleGroup("users:email filter");
    rule1.setDaoKey("localUserDAO");
    rule1.setOperation(Operations.CREATE);
    rule1.setAfter(false);
    rule1.setStops(true);
    rule1.setPriority(60);
    rule1 = (Rule) ruleDAO.put_(x, rule1);

    //the rule has a higher priority than the first rule, changes user's email from nanos@nanos.net to foam@nanos.net
    rule2 = new Rule();
    rule2.setName("userDAO email filter");
    rule2.setRuleGroup("users:email filter");
    rule2.setDaoKey("localUserDAO");
    rule2.setOperation(Operations.CREATE);
    rule2.setAfter(false);
    rule2.setPriority(80);
    Predicate predicate2 = foam.mlang.MLang.AND(
      foam.mlang.MLang.EQ(foam.nanos.auth.User.EMAIL, "nanos@nanos.net"),
      foam.mlang.MLang.INSTANCE_OF(foam.nanos.auth.User.class)
    );
    rule2.setPredicate(predicate2);
    RuleAction action2 = (x1, obj, oldObj) -> {
      User user = (User) obj;
      user.setEmail("foam@nanos.net");
    };
    rule2.setAction(action2);
    rule2 = (Rule) ruleDAO.put_(x, rule2);

    //the rule has lower priority than the first one => should never be executed
    rule3 = new Rule();
    rule3.setName("userDAO email filter");
    rule3.setRuleGroup("users:email filter");
    rule3.setDaoKey("localUserDAO");
    rule3.setOperation(Operations.CREATE);
    rule3.setAfter(false);
    rule3.setPriority(20);
    RuleAction action3 = (x1, obj, oldObj) -> {
      throw new RuntimeException("this rule is not supposed to be executed");
    };
    rule3.setAction(action3);
    rule3 = (Rule) ruleDAO.put_(x, rule3);

    //the rule has lower priority than the first one but has different group so should be executed
    rule4 = new Rule();
    rule4.setName("userDAO lastName filter");
    rule4.setRuleGroup("users:change lastName");
   rule4.setDaoKey("localUserDAO");
    rule4.setOperation(Operations.CREATE);
    rule4.setAfter(false);
    rule4.setPriority(10);
    Predicate predicate4 = foam.mlang.MLang.INSTANCE_OF(foam.nanos.auth.User.class);
    rule4.setPredicate(predicate4);
    RuleAction action4 = (x1, obj, oldObj) -> {
      User user = (User) obj;
      user.setLastName("Smirnova");
    };
    rule4.setAction(action4);
    rule4 = (Rule) ruleDAO.put_(x, rule4);

    //the rule has lower priority than the first one but has different group so should be executed
    rule5 = new Rule();
    rule5.setName("userDAO lastName filter");
    rule5.setRuleGroup("users:change lastName");
   rule5.setDaoKey("localUserDAO");
    rule5.setOperation(Operations.UPDATE);
    rule5.setAfter(false);
    Predicate predicate5 = foam.mlang.MLang.INSTANCE_OF(foam.nanos.auth.User.class);
    rule5.setPredicate(predicate5);
    RuleAction action5 = (x1, obj, oldObj) -> {
      User user = (User) obj;
      user.setLastName("Unknown");
    };
    rule5.setAction(action5);
    rule5 = (Rule) ruleDAO.put_(x, rule5);
  }
  public void removeData(X x) {
    ruleDAO.remove_(x, rule1);
    ruleDAO.remove_(x, rule2);
    ruleDAO.remove_(x, rule3);
    ruleDAO.remove_(x, rule4);
    ruleDAO.remove_(x, rule5);
    userDAO.remove_(x, user);
  }
}
