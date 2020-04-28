package foam.nanos.approval.test;

import static foam.mlang.MLang.DOT;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;
import static foam.mlang.MLang.NEQ;
import static foam.mlang.MLang.NEW_OBJ;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.SequenceNumberDAO;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.auth.LifecycleState;
import foam.nanos.ruler.Operations;
import foam.nanos.ruler.Rule;
import foam.nanos.ruler.RuleAction;
import foam.nanos.ruler.RuleGroup;
import foam.nanos.ruler.RulerDAO;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import foam.nanos.approval.ApprovalDAO;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalRequestUtil;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.approval.SendGroupRequestApprovalDAO;
import foam.nanos.approval.AuthenticatedApprovalDAO;

public class ApprovalDAOTest
extends Test {

  private Group group;
  private ApprovalRequest initialRequest;
  private User userToTest;
  private DAO requestDAO, userDAO, localRuleDAO, groupDAO;

  public void runTest(X x) {
    x = TestUtils.mockDAO(x, "localRuleDAO");
    x = TestUtils.mockDAO(x, "localUserDAO");
    userDAO = new RulerDAO(x, new MDAO(User.getOwnClassInfo()), "testUserDAO");
    x = x.put("localUserDAO", userDAO);
    x = x.put("userDAO", userDAO);

    x = TestUtils.mockDAO(x, "localGroupDAO");
    groupDAO = ((DAO) x.get("localGroupDAO"));
    x = x.put("groupDAO", groupDAO);

    requestDAO = new SendGroupRequestApprovalDAO(x, new foam.dao.ValidatingDAO(x, new SequenceNumberDAO(new AuthenticatedApprovalDAO(x, new ApprovalDAO(x, new MDAO(ApprovalRequest.getOwnClassInfo()))))));
    x = x.put("approvalRequestDAO", requestDAO);
    userDAO = ((DAO) x.get("localUserDAO"));

    localRuleDAO = ((DAO) x.get("localRuleDAO"));

    createGroup();
    createUsers();
    createUserRule(x);
    createGroupRequest();
    testUser(x);
  }

  private void testUser(X x) {
    long numberOfRequests = ((Count)requestDAO.select(new Count())).getValue();

    test(numberOfRequests == 0, "No approval requests at the start of the test");
    userToTest = new User();
    userToTest.setId(5006L);
    userToTest.setFirstName("Pending");
    userToTest = (User) userDAO.put(userToTest);

    numberOfRequests = ((Count)requestDAO.select(new Count())).getValue();

    test(numberOfRequests == 5, "Expected: 5 requests were created, one for each user in the group. Actual: " + numberOfRequests);
    test(userToTest.getFirstName().equals("Pending"), "Expected: Tested user's first name is 'Pending' at the start of the test. Actual: " + userToTest.getFirstName());
DAO unapprovedRequestDAO = ApprovalRequestUtil.getAllRequests(x, userToTest.getId(), initialRequest.getClassification()).where(NEQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED));
    unapprovedRequestDAO.limit(2).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        ApprovalRequest req = (ApprovalRequest)((ApprovalRequest) obj).fclone();
        req.setStatus(ApprovalStatus.APPROVED);
        requestDAO.put_(x, req);
      }
    });

    userToTest = (User) userDAO.find(userToTest);

    test(userToTest.getFirstName().equals("Pending"), "Expected: Tested user's first name is still 'Pending' after 2 requests were approved. Actual: " + userToTest.getFirstName());

    unapprovedRequestDAO.limit(1).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        ApprovalRequest req = (ApprovalRequest)((ApprovalRequest) obj).fclone();
        req.setStatus(ApprovalStatus.APPROVED);
        requestDAO.put_(x, req);
      }
    });

    userToTest = (User) userDAO.find(userToTest);
    numberOfRequests = ((Count)requestDAO.select(new Count())).getValue();

    test(userToTest.getFirstName().equals("Approved"), "Expected: Tested user's first name is 'Approved' since required number of requests were approved. Actual: " + userToTest.getFirstName());
    test(numberOfRequests == 3, "Expected: only 3 requests left in approvalDAO since unused requests were removed after object is approved. Actual: " + numberOfRequests);
  }
  private void createGroup() {
    group = new Group();
    group.setId("testApprovalRequest");
    groupDAO.put(group);
  }

  private void createUsers() {
    User user;
    for ( int i = 5000; i < 5005; i++ ) {
      user = new User();
      user.setId(i);
      user.setFirstName("approver ");
      user.setGroup(group.getId());
      userDAO.put(user);
    }
  }

  private void createGroupRequest() {
    initialRequest = new ApprovalRequest();
    initialRequest.setGroup(group.getId());
    initialRequest.setRequiredPoints(3);
    initialRequest.setClassification("testing approval system");
    initialRequest.setDaoKey("localUserDAO");
  }

  private void createUserRule(X ctx) {
    Rule rule = new Rule();
    rule.setId("12323");
    rule.setName("rule1. testing approval");
    RuleGroup rg = new RuleGroup();
    rg.setId("test approval_CREATE");
    DAO rgDAO = ((DAO) (ctx.get("ruleGroupDAO")));
    rgDAO.put(rg);
    rule.setRuleGroup("test approval_CREATE");
    rule.setDaoKey("testUserDAO");
    rule.setOperation(Operations.CREATE);
    rule.setAfter(true);
    rule.setLifecycleState(LifecycleState.ACTIVE);
    Predicate predicate = EQ(DOT(NEW_OBJ, INSTANCE_OF(foam.nanos.auth.User.class)), true);
    rule.setPredicate(predicate);
    RuleAction action = (x, obj, oldObj, ruler, r, agency) -> {
      initialRequest.setObjId(((User) obj).getId());
      initialRequest = (ApprovalRequest) requestDAO.inX(ctx).put(initialRequest);
    };
    rule.setAction(action);
    localRuleDAO.put(rule);

    Rule rule2 = new Rule();
    rule2.setId("2");
    rule2.setName("rule2. testing approval");
    RuleGroup rg2 = new RuleGroup();
    rg2.setId("test approval_UPDATE");
    rgDAO.put(rg2);
    rule2.setRuleGroup("test approval_UPDATE");
    rule2.setDaoKey("testUserDAO");
    rule2.setOperation(Operations.UPDATE);
    rule2.setAfter(false);
    rule2.setLifecycleState(LifecycleState.ACTIVE);
    Predicate predicate2 = EQ(DOT(NEW_OBJ, INSTANCE_OF(foam.nanos.auth.User.class)), true);
    rule.setPredicate(predicate2);
    RuleAction action2 = (RuleAction) (x, obj, oldObj, ruler, r2, agency) -> {
      User user = (User) obj;
      long points = ApprovalRequestUtil.getApprovedPoints(ctx, userToTest.getId(), initialRequest.getClassification());

      if ( points >= initialRequest.getRequiredPoints() ) {
        user.setFirstName("Approved");
      }
    };
    rule2.setAction(action2);
    localRuleDAO.put(rule2);
  }
}
