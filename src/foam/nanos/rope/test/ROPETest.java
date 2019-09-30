/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.rope.test;

import java.util.List;
import foam.nanos.rope.*;

// import foam.core.*;
// import foam.core.ContextAwareAgent;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
// import foam.dao.MDAO;
// import foam.mlang.predicate.Predicate;
import foam.nanos.auth.*;
// import foam.nanos.auth.AuthService;
// import foam.nanos.rope.*;
// import foam.nanos.ruler.*;
import foam.nanos.test.Test;
import foam.test.TestUtils;
// import java.security.Permission;
// import java.util.Calendar;
// import java.util.Date;
// import java.util.GregorianCalendar;
// import java.util.List;
import static foam.mlang.MLang.*;

public class ROPETest extends Test {
  DAO ropeUserDAO, ropeBusinessDAO, ropeAccountDAO, ropeTransactionDAO;
  DAO ropeAgentJunctionDAO, ropePartnerJunctionDAO, ropeContactDAO, ropeSigningOfficerJunctionDAO;


  public void runTest(X x) {
    x = TestUtils.mockDAO(x, "ropeUserDAO");
    x = TestUtils.mockDAO(x, "ropeBusinessDAO");
    x = TestUtils.mockDAO(x, "ropeAccountDAO");
    x = TestUtils.mockDAO(x, "ropeTransactionDAO");
    x = TestUtils.mockDAO(x, "ropeAgentJunctionDAO");
    x = TestUtils.mockDAO(x, "ropePartnerJunctionDAO");
    x = TestUtils.mockDAO(x, "ropeContactDAO");
    x = TestUtils.mockDAO(x, "ropeSigningOfficerJunctionDAO");

    ropeUserDAO = (DAO) x.get("ropeUserDAO");
    ropeBusinessDAO = (DAO) x.get("ropeBusinessDAO");
    ropeAccountDAO = (DAO) x.get("ropeAccountDAO");
    ropeTransactionDAO = (DAO) x.get("ropeTransactionDAO");
    ropeAgentJunctionDAO = (DAO) x.get("ropeAgentJunctionDAO");
    ropePartnerJunctionDAO = (DAO) x.get("ropePartnerJunctionDAO");
    ropeContactDAO = (DAO) x.get("ropeContactDAO");
    ropeSigningOfficerJunctionDAO = (DAO) x.get("ropeSigningOfficerJunctionDAO");

    setupROPEs(x);
    testROPEContact(x);
    testUserReadTransaction(x);
  }

  /**
   * get the following from their daos:
   * DONE 0. get a ROPEUser from the ROPEUserDAO to use as "self"
   * DONE 1. get an instance of ROPEUserROPEUserJunction obj with srcId = "self", and tgtId = some other valid ROPEUser, if none, create one
   * test the following : 
   * DONE 0. check that "self" is NOT able to perform READ in the ropeUserDAO for this "contact" ROPEUser
   * DONE 1. check that "self" is able to perform CREATE in the ropeContactDAO for this object
   * DONE 2. check that "self" is able to perform READ in the ropeContactDAO for this object
   * DONE 3. check that "self" is able to perform READ in the ropeUserDAO for the contact ROPEUser
   * DONE 4. check that "self" is NOT able to perform UPDATE nor DELETE in the ropeUserDAO for the contact ROPEUser
   * DONE 5. check that "self" is able to perform UPDATE and DELETE in the ropeContactDAO for this object
   *  6. if there are no accounts under contact user, create an account and check that "self" is NOT able to 
   *    perform READ in the ropeAccountDAO for this account
   */
  public void testROPEContact(X x) {
    List<ROPEUser> users = (List<ROPEUser>) ( (ArraySink) ropeUserDAO.select(new ArraySink())).getArray();
    test( ! users.isEmpty(), "ropeUserDAO should not be empty at the start of tests" );

    ROPEUser self = users.get(0);
    ROPEUser target;

    List<ROPEUser> ropeUserJQuery = (List<ROPEUser>) ((ArraySink) ropeContactDAO.where(
      AND(
        EQ(ROPEUserROPEUserJunction.SOURCE_ID, self.getId()),
        NOT( EQ(ROPEUserROPEUserJunction.TARGET_ID, self.getId()) )
      )
    )
    .select(new ArraySink()))
    .getArray();
    if ( ! ropeUserJQuery.isEmpty() )
      target = ropeUserJQuery.get(0);
    else {
      target = new ROPEUser();
      target.setId(self.getId() + 1990);
      target.setName("contactTest");
      ROPEUserROPEUserJunction targetJunction = new ROPEUserROPEUserJunction();
      targetJunction.setSourceId(self.getId());
      targetJunction.setTargetId(target.getId());
      ropeContactDAO.put(targetJunction);
    }

    TestRopeAuthorizer ropeAuthorizer = new TestRopeAuthorizer(x, self, null);

    test(! ropeAuthorizer.ropeSearch(ROPEActions.R, target, x, "ropeUserDAO"), "check that \"self\" is NOT able to perform READ in the ropeUserDAO for this contact ROPEUser");
    test(ropeAuthorizer.ropeSearch(ROPEActions.C, self, x, "ropeContactDAO"), "check that \"self\" is able to perform CREATE in the ropeContactDAO for this object");
    test(ropeAuthorizer.ropeSearch(ROPEActions.R, self, x, "ropeContactDAO"), "check that \"self\" is able to perform READ in the ropeContactDAO for this object");
    test(ropeAuthorizer.ropeSearch(ROPEActions.R, target, x, "ropeUserDAO"), "check that \"self\" is able to perform READ in the ropeUserDAO for the contact ROPEUser");
    test(! ropeAuthorizer.ropeSearch(ROPEActions.U, target, x, "ropeUserDAO"), "check that \"self\" is NOT able to perform UPDATE in the ropeUserDAO for the contact ROPEUser");
    test(! ropeAuthorizer.ropeSearch(ROPEActions.D, target, x, "ropeUserDAO"), "check that \"self\" is NOT able to perform DELETE in the ropeUserDAO for the contact ROPEUser");
    test(ropeAuthorizer.ropeSearch(ROPEActions.U, self, x, "ropeContactDAO"), "check that \"self\" is able to perform UPDATE in the ropeContactDAO for this object");
    test(ropeAuthorizer.ropeSearch(ROPEActions.D, self, x, "ropeContactDAO"), "check that \"self\" is able to perform DELETE in the ropeContactDAO for this object");

    List<ROPEBankAccount> userBankAccounts = ((ArraySink) ropeAccountDAO.where(
      EQ(ROPEBankAccount.OWNER, target.getId())
    )
    .select(new ArraySink()))
    .getArray();

    if (userBankAccounts.isEmpty()) {
      ROPEBankAccount account = new ROPEBankAccount();
      account.setId(1990);
      account.setName("testAccount");
      account.setOwner(target.getId());
      ropeAccountDAO.put(account);

      test(ropeAuthorizer.ropeSearch(ROPEActions.R, self, x, "ropeAccountDAO"), "check that \"self\" is able to perform READ in the ropeAccountDAO for this account");
    }
  }
  
  /**
   * get the following from their daos: 
   * 0. a ROPEUser to use as "self", the ROPEBusiness which "self" is under, and the ROPEAccount associated with the business, if none, create one
   * 1. a ROPEAccount to use as the destination account in a transaction, make sure the account is associated with a business other than own, if none, create one
   * test the following:
   * 0. try to perform CREATE in the ropeTransactionDAO with srcAcct as "self" account and destAcct as "contact" account 
   *    WITHOUT having the contact relationship with "contact" user, check that this fails 
   * 1. CREATE the contact in the ropeContactDAO with src as "self", and tgt as "contact", check that this succeeds 
   * 2. try to perform CREATE in the ropeTransactionDAO with srcAcct as "contact" account and destAcct as "self" account,
   *    check that this fails 
   * 3. try to perform CREATE in the ropeTransactionDAO with srcAcct as "self" account and destAcct as "contact" account,
   *    check that this succeeds
   * 4. check that "self" is NOT able to perform UPDATE nor DELETE in the ropeTransactionDAO on the obj created above after it has been created
   * 5. check that "self" is able to perform READ in the ropeTransactionDAO on the transaction obj created above
   * 6. create a ROPETransaction obj where tgtAcct belongs to "self" and check that "self" is able to perform READ, but not
   *    UPDATE or DELETE on this obj in the ropeTransactionDAO
   * 7. create a ROPETransaction obj where neither srcAcct nor tgtAcct belong to "self", and verify that "self" is not able to 
   *    perform any actions on this obj in the ropeTransactionDAO
   */
  public void testUserReadTransaction(X x) {

  }


  /**
   * set up ROPES for CRUD operation in the following daos 
   * 1. ropeUserDAO
   * 2. ropeBusinessDAO
   * 3. ropeAccountDAO
   * 4. ropeTransactionDAO
   * 5. ropeContactDAO
   */
  public void setupROPEs(X x) {
    ROPEUser temp = new ROPEUser();
    temp.setId(12);
    temp.setName("temp");
    ropeUserDAO.put(temp);

    ROPE transactionAccountROPE = new ROPE();
    transactionAccountROPE.setSourceModel(foam.nanos.rope.test.ROPEBankAccount.getOwnClassInfo());
    transactionAccountROPE.setTargetModel(foam.nanos.rope.test.ROPETransaction.getOwnClassInfo());
    transactionAccountROPE.setSourceDAOKey("ropeAccountDAO");
    transactionAccountROPE.setTargetDAOKey("ropeTransactionDAO");
    // transactionAccountROPE.setJunctionModel();
    // transactionAccountROPE.setJunctionDAOKey();
    transactionAccountROPE.setCardinality("1:*");
    transactionAccountROPE.setInverseName("sourceAccount");
    transactionAccountROPE.setIsInverse(false);
    transactionAccountROPE.setRelationshipImplies();
    transactionAccountROPE.setRequiredSourceAction();
    transactionAccountROPE.setCRUD();
    
  }

}