package foam.nanos.ruler;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import foam.nanos.test.Test;


public class RulerDAOTest extends Test {
  Rule rule1, rule2;
  User user;
  DAO ruleDAO, userDAO;

  public void runTest(X x) {
    ruleDAO = ((DAO) x.get("ruleDAO"));
    userDAO = new RuleDAO(x, (DAO)x.get("localUserDAO"), "localUserDAO");
    x = x.put(userDAO, "localUserDAO");
    createRule(x);
    testUsers(x);
    removeData(x);
  }

  public void testUsers(X x) {
    user = new User();
    user.setFirstName("Kristina");
    user.setEmail("nanos@nanos.net");
    user = (User) userDAO.put_(x, user);
    test(user instanceof User, "No exception thrown: first rule prevented execution of the second");
    //test
    test(user.getEmail().equals("foam@nanos.net"), "RuleDAO changes the email for passed user object");
  }

  public void createRule(X x) {
    // first rule. should stop execution of the next
    rule1 = new Rule();
    rule1.setName("userDAO email filter");
    rule1.setRuleGroup("users:email filter");
    rule1.setDocumentation("test rule on userDAO, changes email 'nanos@nanos.net' to 'foam@nanos.net', stops execution of other rules");
    rule1.setDaoKey("localUserDAO");
    rule1.setOperation(Operations.CREATE);
    rule1.setAfter(false);
    rule1.setStops(true);
    Predicate predicate = foam.mlang.MLang.EQ(foam.nanos.auth.User.EMAIL, "nanos@nanos.net");
    rule1.setPredicate(predicate);
    RuleAction action = (x1, obj) -> {
      if ( ! ( obj instanceof User ) ) {
        throw new RuntimeException("object passed the rule to must be instanceof User");
      }
      User user = (User) obj;
      user.setEmail("foam@nanos.net");
    };
    rule1.setAction(action);
    rule1 = (Rule) ruleDAO.put_(x, rule1);

    //second rule should not be executed
    rule2 = new Rule();
    rule2.setName("userDAO email filter");
    rule2.setRuleGroup("users:email filter");
    rule2.setDocumentation("test rule on userDAO, changes email 'nanos@nanos.net' to 'foam@nanos.net', stops execution of other rules");
    rule2.setDaoKey("localUserDAO");
    rule2.setOperation(Operations.CREATE);
    rule2.setAfter(false);
    rule2.setStops(true);
    Predicate predicate2 = foam.mlang.MLang.INSTANCE_OF(foam.nanos.auth.User.class);
    rule2.setPredicate(predicate2);
    RuleAction action2 = (x1, obj) -> {
      throw new RuntimeException("this rule is not supposed to be executed");
    };
    rule2.setAction(action2);
    rule2 = (Rule) ruleDAO.put_(x, rule2);
  }
  public void removeData(X x) {
    ruleDAO.remove_(x, rule1);
    ruleDAO.remove_(x, rule2);
    userDAO.remove_(x, user);
  }
}
