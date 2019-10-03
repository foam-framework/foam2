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
import foam.dao.MDAO;
// import foam.mlang.predicate.Predicate;
import foam.nanos.auth.*;
// import foam.nanos.auth.AuthService;
// import foam.nanos.rope.*;
// import foam.nanos.ruler.*;
import foam.nanos.test.Test;
import foam.test.TestUtils;
// import java.security.Permission;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import static foam.mlang.MLang.*;
import java.time.LocalTime;

public class ROPETest extends Test {
  DAO ropeDAO, ropeUserDAO, ropeBusinessDAO, ropeAccountDAO, ropeTransactionDAO;
  DAO ropeAgentJunctionDAO, ropePartnerJunctionDAO, ropeContactDAO, ropeSigningOfficerJunctionDAO;
  ROPEUser self, contact;
  ROPEBusiness business1, business2;
  ROPEBankAccount selfAcct, contactAcct;

  public void runTest(X x) {
    
    x = TestUtils.mockDAO(x, "ropeDAO");
    DAO dao = new foam.nanos.rope.test.ROPEUserDAO.Builder(x).setDelegate(new MDAO(ROPEUser.getOwnClassInfo())).build();
    x = x.put("ropeUserDAO", dao);
    x = TestUtils.mockDAO(x, "ropeBusinessDAO");
    x = TestUtils.mockDAO(x, "ropeAccountDAO");
    x = TestUtils.mockDAO(x, "ropeTransactionDAO");
    x = TestUtils.mockDAO(x, "ropeAgentJunctionDAO");
    x = TestUtils.mockDAO(x, "ropePartnerJunctionDAO");
    dao = new foam.nanos.rope.test.ROPEContactDAO.Builder(x).setDelegate(new MDAO(ROPEBusinessROPEBusinessJunction.getOwnClassInfo())).build();
    x = x.put("ropeContactDAO", dao);
    x = TestUtils.mockDAO(x, "ropeSigningOfficerJunctionDAO");

    ropeDAO = (DAO) x.get("ropeDAO");
    ropeUserDAO = (DAO) x.get("ropeUserDAO");
    ropeBusinessDAO = (DAO) x.get("ropeBusinessDAO");
    ropeAccountDAO = (DAO) x.get("ropeAccountDAO");
    ropeTransactionDAO = (DAO) x.get("ropeTransactionDAO");
    ropeAgentJunctionDAO = (DAO) x.get("ropeAgentJunctionDAO");
    ropePartnerJunctionDAO = (DAO) x.get("ropePartnerJunctionDAO");
    ropeContactDAO = (DAO) x.get("ropeContactDAO");
    ropeSigningOfficerJunctionDAO = (DAO) x.get("ropeSigningOfficerJunctionDAO");

    self = new ROPEUser();
    self.setId(1);
    self.setName("self");
    self.setOrganization("abc");
    self = (ROPEUser) ropeUserDAO.put_(x, self);
    business1 = (ROPEBusiness) ropeBusinessDAO.find(2);

    setupROPEs(x);

    LocalTime then = LocalTime.now();
    testROPEContact(x);
    testROPETransaction(x);
    LocalTime now = LocalTime.now();
    System.out.println("start : " + then);
    System.out.println("end   : " + now);
  }

  public void testROPEContact(X x) {

    contact = new ROPEUser();
    contact.setId(11);
    contact.setName("contact");
    contact.setOrganization("xyz");
    contact = (ROPEUser) ropeUserDAO.put_(x, contact);
    business2 = (ROPEBusiness) ropeBusinessDAO.find(12);
    
    test(! (new TestRopeAuthorizer(x, self, null)).ropeSearch(ROPEActions.R, contact, x, "ropeUserDAO"), "check that \"self\" is NOT able to perform READ in the ropeUserDAO for this contact ROPEUser");
    ROPEBusinessROPEBusinessJunction targetJunction = new ROPEBusinessROPEBusinessJunction();
    targetJunction.setSourceId(business1.getId());
    targetJunction.setTargetId(business2.getId());
    ropeContactDAO.put(targetJunction);


    test((new TestRopeAuthorizer(x, self, null)).ropeSearch(ROPEActions.R, contact, x, "ropeUserDAO"), "check that \"self\" is able to perform READ in the ropeUserDAO for the contact ROPEUser");
    test(!(new TestRopeAuthorizer(x, self, null)).ropeSearch(ROPEActions.U, contact, x, "ropeUserDAO"), "check that \"self\" is NOT able to perform UPDATE in the ropeUserDAO for the contact ROPEUser");
    test(!(new TestRopeAuthorizer(x, self, null)).ropeSearch(ROPEActions.D, contact, x, "ropeUserDAO"), "check that \"self\" is NOT able to perform DELETE in the ropeUserDAO for the contact ROPEUser");


  }

  public void testROPETransaction(X x) {

    contactAcct = new ROPEBankAccount();
    contactAcct.setId(1990);
    contactAcct.setName("contactAccount");
    contactAcct.setAccountOwner(business2.getId());
    ropeAccountDAO.put(contactAcct);

    selfAcct = new ROPEBankAccount();
    selfAcct.setId(1991);
    selfAcct.setName("selfAccount");
    selfAcct.setAccountOwner(business1.getId());
    ropeAccountDAO.put(selfAcct);

    test((new TestRopeAuthorizer(x, self, null)).ropeSearch(ROPEActions.R, selfAcct, x, "ropeAccountDAO"), "check that \"self\" is able to perform in READ in the ropeAccountDAO for own account");
    test(!(new TestRopeAuthorizer(x, self, null)).ropeSearch(ROPEActions.R, contactAcct, x, "ropeAccountDAO"), "check that \"self\" is NOT able to perform READ in the ropeAccountDAO for this account");

    ROPETransaction t1 = new ROPETransaction();
    t1.setId(121);
    t1.setName("testTransaction");
    t1.setSourceAccount(selfAcct.getId());
    t1.setDestinationAccount(contactAcct.getId());
    test ((new TestRopeAuthorizer(x, self, null)).ropeSearch(ROPEActions.C, t1, x, "ropeTransactionDAO"), "check that \"self\" is able to create a transaction where selfAcct is the source account");
    t1 = (ROPETransaction) ropeTransactionDAO.put(t1);
    test( (new TestRopeAuthorizer(x, self, null)).ropeSearch(ROPEActions.R, t1, x, "ropeTransactionDAO"), "check that \"self\" is able to view transaction paid out of selfAcct");
    
    ROPETransaction t2 = new ROPETransaction();
    t2.setId(122);
    t2.setName("failedTransaction");
    t2.setSourceAccount(contactAcct.getId());
    t2.setDestinationAccount(selfAcct.getId());
    t2 = (ROPETransaction) ropeTransactionDAO.put(t2);
    test(!(new TestRopeAuthorizer(x, self, null)).ropeSearch(ROPEActions.C, t2, x, "ropeTransactionDAO"), "check that \"self\" is NOT able to create a transaction with a sourceAccount not belonging to \"self\"");

    ROPETransaction t3 = new ROPETransaction();
    t3.setId(123);
    t3.setName("contactTransaction");
    t3.setSourceAccount(contactAcct.getId());
    t3.setDestinationAccount(contactAcct.getId());
    t3 = (ROPETransaction) ropeTransactionDAO.put(t3);
    test(!(new TestRopeAuthorizer(x, self, null)).ropeSearch(ROPEActions.R, t3, x, "ropeTransactionDAO"), "check that \"self\" is NOT able to read the transaction of other people");

    test((new TestRopeAuthorizer(x, self, null)).ropeSearch(ROPEActions.R, t2, x, "ropeTransactionDAO"), "check that \"self\" is able to read a transaction where selfAcct is the destination account");

  }

  public void setupROPEs(X x) {

    // foam.RELATIONSHIP({
    //   cardinality: '1:*',
    //   sourceModel: 'foam.nanos.rope.test.ROPEBankAccount',
    //   targetModel: 'foam.nanos.rope.test.ROPETransaction',
    //   forwardName: 'debits',
    //   inverseName: 'sourceAccount',
    //   targetDAOKey: 'ropeTransactionDAO'
    // });
    ROPE transactionAccountROPE = new ROPE();
    transactionAccountROPE.setSourceModel(foam.nanos.rope.test.ROPEBankAccount.getOwnClassInfo());
    transactionAccountROPE.setTargetModel(foam.nanos.rope.test.ROPETransaction.getOwnClassInfo());
    transactionAccountROPE.setSourceDAOKey("ropeAccountDAO");
    transactionAccountROPE.setTargetDAOKey("ropeTransactionDAO");
    transactionAccountROPE.setCardinality("1:*");
    transactionAccountROPE.setInverseName("sourceAccount");
    transactionAccountROPE.setIsInverse(false);
    Map<ROPEActions, List<ROPEActions>> crud = new HashMap<ROPEActions, List<ROPEActions>>();
    crud.put(ROPEActions.C, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.OWN)));
    crud.put(ROPEActions.R, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.OWN)));
    crud.put(ROPEActions.OWN, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.OWN)));
    transactionAccountROPE.setCRUD(crud);
    ropeDAO.put(transactionAccountROPE);

    // foam.RELATIONSHIP({
    //   cardinality: '1:*',
    //   sourceModel: 'foam.nanos.rope.test.ROPEBankAccount',
    //   targetModel: 'foam.nanos.rope.test.ROPETransaction',
    //   forwardName: 'credits',
    //   inverseName: 'destinactionAccount',
    //   targetDAOKey: 'ropeTransactionDAO'
    // });
    transactionAccountROPE = new ROPE();
    transactionAccountROPE.setSourceModel(foam.nanos.rope.test.ROPEBankAccount.getOwnClassInfo());
    transactionAccountROPE.setTargetModel(foam.nanos.rope.test.ROPETransaction.getOwnClassInfo());
    transactionAccountROPE.setSourceDAOKey("ropeAccountDAO");
    transactionAccountROPE.setTargetDAOKey("ropeTransactionDAO");
    transactionAccountROPE.setCardinality("1:*");
    transactionAccountROPE.setInverseName("destinationAccount");
    transactionAccountROPE.setIsInverse(false);
    crud = new HashMap<ROPEActions, List<ROPEActions>>();
    crud.put(ROPEActions.R, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.OWN)));
    crud.put(ROPEActions.OWN, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.OWN)));
    transactionAccountROPE.setCRUD(crud);
    ropeDAO.put(transactionAccountROPE);


    // foam.RELATIONSHIP({
    //   cardinality: '1:*',
    //   sourceModel: 'foam.nanos.rope.test.ROPEUser',
    //   targetModel: 'foam.nanos.rope.test.ROPEBankAccount',
    //   forwardName: 'bankaccounts',
    //   inverseName: 'owner',
    //   targetDAOKey: 'ropeAccountDAO'
    // });
    ROPE accountUserROPE = new ROPE();
    accountUserROPE.setSourceModel(foam.nanos.rope.test.ROPEBusiness.getOwnClassInfo());
    accountUserROPE.setTargetModel(foam.nanos.rope.test.ROPEBankAccount.getOwnClassInfo());
    accountUserROPE.setSourceDAOKey("ropeUserDAO");
    accountUserROPE.setTargetDAOKey("ropeAccountDAO");
    accountUserROPE.setCardinality("1:*");
    accountUserROPE.setInverseName("accountOwner");
    accountUserROPE.setIsInverse(false);
    crud = new HashMap<ROPEActions, List<ROPEActions>>();
    crud.put(ROPEActions.C, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.ACT_AS)));
    crud.put(ROPEActions.R, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.ACT_AS)));
    crud.put(ROPEActions.U, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.ACT_AS)));
    crud.put(ROPEActions.D, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.ACT_AS)));
    crud.put(ROPEActions.OWN, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.ACT_AS)));
    accountUserROPE.setCRUD(crud);
    ropeDAO.put(accountUserROPE);

    // foam.RELATIONSHIP({
    //   cardinality: '*:*',
    //   sourceModel: 'foam.nanos.rope.test.ROPEBusiness',
    //   targetModel: 'foam.nanos.rope.test.ROPEBusiness',
    //   sourceDAOKey: 'ropeUserDAO',
    //   targetDAOKey: 'ropeUserDAO',
    //   forwardName: 'contacts',
    //   inverseName: 'owner',
    //   junctionDAOKey: 'ropeContactDAO'
    // });
    ROPE contactROPE = new ROPE();
    contactROPE.setSourceModel(foam.nanos.rope.test.ROPEBusiness.getOwnClassInfo());
    contactROPE.setTargetModel(foam.nanos.rope.test.ROPEBusiness.getOwnClassInfo());
    contactROPE.setSourceDAOKey("ropeUserDAO");
    contactROPE.setTargetDAOKey("ropeUserDAO");
    contactROPE.setJunctionModel(foam.nanos.rope.test.ROPEBusinessROPEBusinessJunction.getOwnClassInfo());
    contactROPE.setJunctionDAOKey("ropeContactDAO");
    contactROPE.setCardinality("*:*");
    contactROPE.setInverseName("contacts");
    contactROPE.setIsInverse(true);
    crud = new HashMap<ROPEActions, List<ROPEActions>>();
    crud.put(ROPEActions.R, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.ACT_AS)));
    contactROPE.setCRUD(crud);
    ropeDAO.put(contactROPE);

    contactROPE = new ROPE();
    contactROPE.setSourceModel(foam.nanos.rope.test.ROPEBusiness.getOwnClassInfo());
    contactROPE.setTargetModel(foam.nanos.rope.test.ROPEBusiness.getOwnClassInfo());
    contactROPE.setSourceDAOKey("ropeUserDAO");
    contactROPE.setTargetDAOKey("ropeUserDAO");
    contactROPE.setJunctionModel(foam.nanos.rope.test.ROPEBusinessROPEBusinessJunction.getOwnClassInfo());
    contactROPE.setJunctionDAOKey("ropeContactDAO");
    contactROPE.setCardinality("*:*");
    contactROPE.setInverseName("owner");
    contactROPE.setIsInverse(false);
    crud = new HashMap<ROPEActions, List<ROPEActions>>();
    crud.put(ROPEActions.R, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.ACT_AS)));
    contactROPE.setCRUD(crud);
    ropeDAO.put(contactROPE);

    // foam.RELATIONSHIP({
    //   cardinality: '*:*',
    //   sourceModel: 'foam.nanos.rope.test.ROPEUser',
    //   targetModel: 'foam.nanos.rope.test.ROPEUser',
    //   sourceDAOKey: 'ropeUserDAO',
    //   targetDAOKey: 'ropeUserDAO',
    //   forwardName: 'entities',
    //   inverseName: 'agents',
    //   junctionDAOKey: 'ropeAgentJunctionDAO'
    // });
    ROPE agentROPE = new ROPE();
    agentROPE.setSourceModel(foam.nanos.rope.test.ROPEUser.getOwnClassInfo());  //user
    agentROPE.setTargetModel(foam.nanos.rope.test.ROPEBusiness.getOwnClassInfo()); //business
    agentROPE.setSourceDAOKey("ropeUserDAO");
    agentROPE.setTargetDAOKey("ropeUserDAO");
    agentROPE.setJunctionModel(foam.nanos.rope.test.ROPEUserROPEBusinessJunction.getOwnClassInfo());
    agentROPE.setJunctionDAOKey("ropeAgentJunctionDAO");
    agentROPE.setCardinality("*:*");
    agentROPE.setInverseName("agents");
    agentROPE.setIsInverse(false);
    crud = new HashMap<ROPEActions, List<ROPEActions>>();
    crud.put(ROPEActions.ACT_AS, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.OWN)));
    agentROPE.setCRUD(crud);
    ropeDAO.put(agentROPE);

    ROPE inverseAgentROPE = new ROPE();
    inverseAgentROPE.setSourceModel(foam.nanos.rope.test.ROPEBusiness.getOwnClassInfo());
    inverseAgentROPE.setTargetModel(foam.nanos.rope.test.ROPEUser.getOwnClassInfo());
    inverseAgentROPE.setSourceDAOKey("ropeUserDAO");
    inverseAgentROPE.setTargetDAOKey("ropeUserDAO");
    inverseAgentROPE.setJunctionModel(foam.nanos.rope.test.ROPEUserROPEBusinessJunction.getOwnClassInfo());
    inverseAgentROPE.setJunctionDAOKey("ropeAgentJunctionDAO");
    inverseAgentROPE.setCardinality("*:*");
    inverseAgentROPE.setInverseName("entities");
    inverseAgentROPE.setIsInverse(true);
    crud = new HashMap<ROPEActions, List<ROPEActions>>();
    crud.put(ROPEActions.R, new ArrayList<ROPEActions>(Arrays.asList(ROPEActions.R, ROPEActions.ACT_AS))); // if u can read the business, u can read its agent
    inverseAgentROPE.setCRUD(crud);
    ropeDAO.put(inverseAgentROPE);
  }

}