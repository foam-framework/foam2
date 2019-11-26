// /**
//  * @license
//  * Copyright 2019 The FOAM Authors. All Rights Reserved.
//  * http://www.apache.org/licenses/LICENSE-2.0
//  */
package foam.nanos.rope.test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import foam.core.*;
import foam.nanos.auth.*;
import foam.core.X;
import foam.dao.*;
import foam.dao.MDAO;
import foam.nanos.rope.*;
import foam.nanos.auth.User;
import net.nanopay.tx.model.Transaction;
import net.nanopay.account.Account;
import net.nanopay.account.AccountUserJunction;
import net.nanopay.approval.ApprovalRequest;
import net.nanopay.liquidity.roles.*;
import foam.mlang.sink.Count;

import static foam.mlang.MLang.*;

public class LiquifiedRopeTest extends Test {

  DAO userDAO, accountDAO, transactionDAO, approvalRequestDAO, ropeDAO;
  DAO accountViewerJunctionDAO, accountMakerJunctionDAO, accountApproverJunctionDAO, transactionViewerJunctionDAO, transactionMakerJunctionDAO, transactionApproverJunctionDAO, roleAssignmentApproverJunctionDAO, roleAssignmentMakerJunctionDAO, roleDAO, roleAssignmentTrunctionDAO, roleAssignmentTemplateDAO;
  User accountViewer, accountMaker, accountApprover, transactionViewer, transactionMaker, transactionApprover, root;
  Account rootAccount;
  AccountUserJunction aujunction;
  Role transactionViewerRole, transactionMakerRole, transactionApproverRole, accountViewerRole, accountMakerRole, accountApproverRole, roleAssignmentApproverRole, roleAssignmentMakerRole;

  public void runTest(X x) {
    x = x.put("localUserDAO", new MDAO(User.getOwnClassInfo()));
    DAO easydao = new foam.dao.EasyDAO.Builder(x).setInnerDAO((DAO) x.get("localUserDAO")).setAuthorize(false).setOf(User.getOwnClassInfo()).build();
    x = x.put("userDAO", easydao);
    x = x.put("accountDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Account.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountDAO").build()).build());
    x = x.put("transactionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Transaction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionDAO").build()).build());
    x = x.put("approvalRequestDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(ApprovalRequest.getOwnClassInfo())).setAuthorizer(new foam.nanos.auth.AuthorizableAuthorizer("approvalRequestDAO")).build());
    x = x.put("accountViewerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountViewerJunctionDAO").build()).build());
    x = x.put("accountMakerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountMakerJunctionDAO").build()).build());
    x = x.put("accountApproverJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountApproverJunctionDAO").build()).build());
    x = x.put("transactionViewerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionViewerJunctionDAO").build()).build());
    x = x.put("transactionMakerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionMakerJunctionDAO").build()).build());
    x = x.put("transactionApproverJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionApproverJunctionDAO").build()).build());
    x = x.put("roleAssignmentMakerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("roleAssignmentMakerJunctionDAO").build()).build());
    x = x.put("roleAssignmentApproverJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("roleAssignmentApproverJunctionDAO").build()).build());
    // x = x.put("roleDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(net.nanopay.liquidity.roles.Role.getOwnClassInfo())).setAuthorizer(new foam.nanos.auth.StandardAuthorizer("roleDAO")).build());
    
    // TODO ruby authorize these daos
    x = x.put("roleDAO", new MDAO(net.nanopay.liquidity.roles.Role.getOwnClassInfo()));
    x = x.put("roleRoleJunctionDAO", new MDAO(net.nanopay.liquidity.roles.RoleRoleJunction.getOwnClassInfo()));
    // x = x.put("roleAssignmentTrunctionDAO", new MDAO(RoleAssignmentTrunction.getOwnClassInfo()));
    x = x.put("roleAssignmentTemplateDAO", new MDAO(RoleAssignmentTemplate.getOwnClassInfo()));
    x = x.put("roleAssignmentTrunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(net.nanopay.liquidity.roles.RoleAssignmentTrunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("roleAssignmentTrunctionDAO").build()).build());
    // x = x.put("roleAssignmentTemplateDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(net.nanopay.liquidity.roles.RoleAssignmentTemplate.getOwnClassInfo())).setAuthorizer(new foam.nanos.auth.StandardAuthorizer("roleAssignmentTemplateDAO")).build());
    x = x.put("ropeDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(foam.nanos.rope.ROPE.getOwnClassInfo())).setAuthorizer(new foam.nanos.auth.GlobalReadAuthorizer("ropeDAO")).build());

    ropeDAO = (DAO) x.get("ropeDAO");
    userDAO = (DAO) x.get("userDAO");
    accountDAO = (DAO) x.get("accountDAO");
    transactionDAO = (DAO) x.get("transactionDAO");
    approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
    accountViewerJunctionDAO = (DAO) x.get("accountViewerJunctionDAO");
    accountMakerJunctionDAO = (DAO) x.get("accountMakerJunctionDAO");
    accountApproverJunctionDAO = (DAO) x.get("accountApproverJunctionDAO");
    transactionViewerJunctionDAO = (DAO) x.get("transactionViewerJunctionDAO");
    transactionMakerJunctionDAO = (DAO) x.get("transactionMakerJunctionDAO");
    transactionApproverJunctionDAO = (DAO) x.get("transactionApproverJunctionDAO");
    roleAssignmentMakerJunctionDAO = (DAO) x.get("roleAssignmentMakerJunctionDAO");
    roleAssignmentApproverJunctionDAO = (DAO) x.get("roleAssignmentApproverJunctionDAO");
    roleDAO = (DAO) x.get("roleDAO");
    roleAssignmentTrunctionDAO = (DAO) x.get("roleAssignmentTrunctionDAO");
    roleAssignmentTemplateDAO = (DAO) x.get("roleAssignmentTemplateDAO");

    setupLiquidROPEs(x);
    setupBasicRoles(x);
    testLiquid(x);

  }

  public void testLiquid(X x) {

    setupLiquidRootUserAndAccount(x);

    x = x.put("user", root);

    // root user add accountmaker for rootaccount
    User accountMaker101 = new User.Builder(x).setId(12).build();
    accountMaker101 = (User) userDAO.put(accountMaker101);
    Role accountMakerRole = (Role) roleDAO.find(EQ(Role.NAME, "accountMaker"));
    accountMakerRole.assign(x, new ArrayList<Long>(Arrays.asList(accountMaker101.getId())), new ArrayList<Long>(Arrays.asList(rootAccount.getId())));
    AccountUserJunction auj = (AccountUserJunction) accountMakerJunctionDAO.find(AND(EQ(AccountUserJunction.SOURCE_ID, rootAccount.getId()), EQ(AccountUserJunction.TARGET_ID, accountMaker101.getId())));
    RoleAssignmentTrunction rat = (RoleAssignmentTrunction) roleAssignmentTrunctionDAO.find(AND(EQ(RoleAssignmentTrunction.ACCOUNT_ID, rootAccount.getId()), EQ(RoleAssignmentTrunction.USER_ID, accountMaker101.getId()), EQ(RoleAssignmentTrunction.ROLE_ID, accountMakerRole.getId())));
    test(auj != null && rat != null, "1. root user able to put user into accountmakerjunctiondao via role.assign");

    // accountMaker101 can create account 102 with parent account 101
    Account account102 = new Account.Builder(x).setId(102).setParent(101).build();
    account102 = (Account) accountDAO.inX(x.put("user", accountMaker101)).put(account102);
    test(account102 != null, "2. accountMaker101 can create account 102 with parent account 101");

    // add accountuser junctions to root user
    addAccountPrivilegesToRoot(x, root, account102);

    // root user add accountviewer for account102
    User accountViewer102 = new User.Builder(x).setId(13).build();
    accountViewer102 = (User) userDAO.put(accountViewer102);
    Role accountViewerRole = (Role) roleDAO.find(EQ(Role.NAME, "accountViewer"));
    accountViewerRole.assign(x, new ArrayList<Long>(Arrays.asList(accountViewer102.getId())), new ArrayList<Long>(Arrays.asList(account102.getId())));
    auj = (AccountUserJunction) accountViewerJunctionDAO.find(AND(EQ(AccountUserJunction.SOURCE_ID, account102.getId()), EQ(AccountUserJunction.TARGET_ID, accountViewer102.getId())));
    rat = (RoleAssignmentTrunction) roleAssignmentTrunctionDAO.find(AND(EQ(RoleAssignmentTrunction.ACCOUNT_ID, account102.getId()), EQ(RoleAssignmentTrunction.USER_ID, accountViewer102.getId()), EQ(RoleAssignmentTrunction.ROLE_ID, accountViewerRole.getId())));
    test(auj != null && rat != null, "3. root user able to put user into accountviewerjunctiondao via role.assign");

    List<Account> accountsViewableByAccountViewer102 = (ArrayList<Account>) ((ArraySink) accountDAO.inX(x.put("user", accountViewer102)).select(new ArraySink())).getArray();
    test(accountsViewableByAccountViewer102.size() == 1 && accountsViewableByAccountViewer102.get(0).getId() == 102, "4. accountViewer102 can view account102, but not any other accounts");

    Account account103 = new Account.Builder(x).setId(103).setParent(102).build();
    final DAO tempAccountDAO = (DAO) ((DAO) x.get("accountDAO")).inX(x.put("user", accountViewer102));
    test(
      TestUtils.testThrows(
        () -> tempAccountDAO.put(account103),
        "You don't have permission to create this object",
        foam.nanos.auth.AuthorizationException.class
      ),
      "5. accountViewer102 cannot create account103 under parent account102"
    );

    // test user without transactionmaker junction cannot put into transactiondao
    // final Transaction t = new Transaction();
    // t.setId("1001");
    // t.setSourceAccount(rootAccount.getId());
    // t.setDestinationAccount(rootAccount.getId());

    // transactionMaker = new User();
    // transactionMaker.setFirstName("transaction");
    // transactionMaker.setLastName("maker");
    // transactionMaker.setId(12);
    // transactionMaker = (User) userDAO.put(transactionMaker);
    // final DAO tempTransactionDAO = (DAO) ((DAO) x.get("transactionDAO")).inX(x.put("user", transactionMaker));
    // test(
    //   TestUtils.testThrows(
    //     () -> tempTransactionDAO.put(t),
    //     "You don't have permission to create this object",
    //     foam.nanos.auth.AuthorizationException.class
    //   ),
    //   "user without transactionmaker junction cannot put into transactiondao"
    // );

    // test root user can put into transactiondao
    // test((Transaction) transactionDAO.inX(x).put(t) != null, "root user can create Transaction" + t.getId());

    // test root user can create transactionmakerjunction for root account
    
    // AccountUserJunction accountTransactionMakerJunction = new AccountUserJunction();
    // accountTransactionMakerJunction.setSourceId(rootAccount.getId());
    // accountTransactionMakerJunction.setTargetId(transactionMaker.getId());
    // accountTransactionMakerJunction = (AccountUserJunction) transactionMakerJunctionDAO.inX(x).put(accountTransactionMakerJunction);
    
    // test(accountTransactionMakerJunction != null, "root user can create transactionmaker" + accountTransactionMakerJunction.getId());

    // // test root user can create transaction viewer junction for root account
    // transactionViewer = new User();
    // transactionViewer.setFirstName("transaction");
    // transactionViewer.setLastName("viewer");
    // transactionViewer.setId(333);
    // transactionViewer = (User) userDAO.put(transactionViewer);

    // AccountUserJunction accountTransactionViewerJunction = new AccountUserJunction();
    // accountTransactionViewerJunction.setSourceId(rootAccount.getId());
    // accountTransactionViewerJunction.setTargetId(transactionViewer.getId());
    // accountTransactionViewerJunction = (AccountUserJunction) transactionViewerJunctionDAO.inX(x).put(accountTransactionViewerJunction);
    
    // test(accountTransactionViewerJunction != null, "root user can create transactionviewer" + accountTransactionViewerJunction.getId());

    // // test root user can create role maker junction for root account    
    // roleMaker = new User();
    // roleMaker.setFirstName("role");
    // roleMaker.setLastName("maker");
    // roleMaker.setId(444);
    // roleMaker = (User) userDAO.put(roleMaker);

    // AccountUserJunction accountRoleMakerJunction = new AccountUserJunction();
    // accountRoleMakerJunction.setSourceId(rootAccount.getId());
    // accountRoleMakerJunction.setTargetId(roleMaker.getId());
    // accountRoleMakerJunction = (AccountUserJunction) roleMakerJunctionDAO.inX(x).put(accountRoleMakerJunction);
    // test(accountRoleMakerJunction != null, "root user can create roleMaker" + accountRoleMakerJunction.getId());

    // // put role maker as context user, test rolemaker create accountuserjunctions
    // x.put("user", roleMaker);
    // transactionApprover = new User();
    // transactionApprover.setFirstName("transaction");
    // transactionApprover.setLastName("approver");
    // transactionApprover.setId(555);
    // transactionApprover = (User) userDAO.put(transactionApprover);

    // AccountUserJunction accountTransactionApproverJunction = new AccountUserJunction();
    // accountTransactionApproverJunction.setSourceId(rootAccount.getId());
    // accountTransactionApproverJunction.setTargetId(transactionApprover.getId());
    // accountTransactionApproverJunction = (AccountUserJunction) transactionApproverJunctionDAO.inX(x).put(accountTransactionApproverJunction);
    // test(accountTransactionApproverJunction != null, "rolemaker user can create transactionapprover" + accountTransactionApproverJunction.getId());

    // accountMaker = new User();
    // accountMaker.setFirstName("account");
    // accountMaker.setLastName("maker");
    // accountMaker.setId(666);
    // accountMaker = (User) userDAO.put(accountMaker);
    // AccountUserJunction accountAccountMakerJunction = new AccountUserJunction();
    // accountAccountMakerJunction.setSourceId(rootAccount.getId());
    // accountAccountMakerJunction.setTargetId(accountMaker.getId());
    // accountAccountMakerJunction = (AccountUserJunction) accountMakerJunctionDAO.inX(x).put(accountAccountMakerJunction);
    // test(accountAccountMakerJunction != null, "rolemaker user can create accountmaker" + accountAccountMakerJunction.getId());

    // accountViewer = new User();
    // accountViewer.setFirstName("account");
    // accountViewer.setLastName("viewer");
    // accountViewer.setId(777);
    // accountViewer = (User) userDAO.put(accountViewer);
    // AccountUserJunction accountAccountViewerJunction = new AccountUserJunction();
    // accountAccountViewerJunction.setSourceId(rootAccount.getId());
    // accountAccountViewerJunction.setTargetId(accountViewer.getId());
    // accountAccountViewerJunction = (AccountUserJunction) accountViewerJunctionDAO.inX(x).put(accountAccountViewerJunction);
    // test(accountAccountViewerJunction != null, "rolemaker user can create accountViewer" + accountAccountViewerJunction.getId());

    // accountApprover = new User();
    // accountApprover.setFirstName("account");
    // accountApprover.setLastName("approver");
    // accountApprover.setId(888);
    // accountApprover = (User) userDAO.put(accountApprover);
    // AccountUserJunction accountAccountApproverJunction = new AccountUserJunction();
    // accountAccountApproverJunction.setSourceId(rootAccount.getId());
    // accountAccountApproverJunction.setTargetId(accountApprover.getId());
    // accountAccountApproverJunction = (AccountUserJunction) accountApproverJunctionDAO.inX(x).put(accountAccountApproverJunction);
    // test(accountAccountApproverJunction != null, "rolemaker user can create accountApprover" + accountAccountApproverJunction.getId());

    // roleApprover = new User();
    // roleApprover.setFirstName("role");
    // roleApprover.setLastName("approver");
    // roleApprover.setId(999);
    // roleApprover = (User) userDAO.put(roleApprover);
    // AccountUserJunction accountRoleApproverJunction = new AccountUserJunction();
    // accountRoleApproverJunction.setSourceId(rootAccount.getId());
    // accountRoleApproverJunction.setTargetId(roleApprover.getId());
    // accountRoleApproverJunction = (AccountUserJunction) roleApproverJunctionDAO.inX(x).put(accountRoleApproverJunction);
    // test(accountRoleApproverJunction != null, "rolemaker user can create roleApprover" + accountRoleApproverJunction.getId());


    // roleViewer = new User();
    // roleViewer.setFirstName("role");
    // roleViewer.setLastName("viewer");
    // roleViewer.setId(101010);
    // roleViewer = (User) userDAO.put(roleViewer);
    // AccountUserJunction accountRoleViewerJunction = new AccountUserJunction();
    // accountRoleViewerJunction.setSourceId(rootAccount.getId());
    // accountRoleViewerJunction.setTargetId(roleViewer.getId());
    // accountRoleViewerJunction = (AccountUserJunction) roleViewerJunctionDAO.inX(x).put(accountRoleViewerJunction);
    // test(accountRoleViewerJunction != null, "rolemaker user can create roleViewer" + accountRoleViewerJunction.getId());

    // // test account maker create child account
    // Account childAccount1 = new Account();
    // childAccount1.setId(222);
    // childAccount1.setParent(rootAccount.getId());
    // childAccount1 = (Account) accountDAO.inX(x.put("user", accountMaker)).put(childAccount1);
    // test(childAccount1 != null, "accountmaker user can create direct child account under account in which they are accountmaker of");


    // // test transaction viewer cannot create transaction 
    // final Transaction t1 = new Transaction();
    // t1.setId("999");
    // t1.setSourceAccount(rootAccount.getId());
    // t1.setDestinationAccount(rootAccount.getId());
    // final DAO tempTransactionDAO2 = tempTransactionDAO.inX(x.put("user", transactionViewer));
    // test(
    //   TestUtils.testThrows(
    //     () -> tempTransactionDAO2.put(t1),
    //     "You don't have permission to create this object",
    //     foam.nanos.auth.AuthorizationException.class
    //   ),
    //   "transactionViewer cannot create transaction"
    // );

    // // test transaction maker can create transaction
    // x = x.put("user", transactionMaker);
    // Transaction returnedt1 = (Transaction) transactionDAO.inX(x).put(t1);
    // test(returnedt1 != null, "transactionMaker user can create Transaction" + returnedt1.getId());

    // // test transaction viewer can view transaction
    // x = x.put("user", transactionViewer);
    // Transaction viewedTransaction = (Transaction) transactionDAO.inX(x).find(returnedt1.getId());
    // test(viewedTransaction != null, "transactionViewer user can view transaction");

  }

  public void setupLiquidROPEs(X x) {
    List<String> list = new ArrayList<String>();
    Map<String, NextRelationshipsList> createMap = new HashMap<String, NextRelationshipsList>();
    Map<String, NextRelationshipsList> readMap = new HashMap<String, NextRelationshipsList>();
    Map<String, NextRelationshipsList> updateMap = new HashMap<String, NextRelationshipsList>();
    Map<String, NextRelationshipsList> deleteMap = new HashMap<String, NextRelationshipsList>();
    Map<String, NextRelationshipsList> relationshipMap = new HashMap<String, NextRelationshipsList>();
    CRUDMap crudMapObj;
    RelationshipMap relationshipMapObj;

    // PARENT CHILD ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "accountMakers", "accountApprovers" ));
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    list = new ArrayList<String>(Arrays.asList( "transactionMakers", "transactionApprovers", "parent" ));
    relationshipMap.put("sourceAccount", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    list = new ArrayList<String>(Arrays.asList( "transactionViewers", "parent" ));
    relationshipMap.put("destinationAccount", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMapObj = new RelationshipMap.Builder(x).setMap(relationshipMap).build();

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("1:*")
      .setRelationshipKey("parent")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();
    relationshipMapObj = null;
    crudMapObj = null;

    // ACCOUNT VIEWER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts, but can read it
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    list = new ArrayList<String>(Arrays.asList("__terminate__"));
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    relationshipMap.put("parent", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMapObj = new RelationshipMap.Builder(x).setMap(relationshipMap).build();

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("accountViewers")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();
    relationshipMapObj = null;
    crudMapObj = null;

    // ACCOUNT MAKER ROPE 
        
    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts, but can read it
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    list = new ArrayList<String>(Arrays.asList("__terminate__"));
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    relationshipMap.put("parent", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMapObj = new RelationshipMap.Builder(x).setMap(relationshipMap).build();

    ropeDAO.inX(x).put(
      new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("accountMakers")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;

    // ACCOUNT APPROVER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts, but can read it
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    list = new ArrayList<String>(Arrays.asList("__terminate__"));
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    relationshipMap.put("accountApprovalRequest", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMapObj = new RelationshipMap.Builder(x).setMap(relationshipMap).build();

    ropeDAO.inX(x).put(
      new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("accountApprovers")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;


    // TRANSACTION VIEWER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    list = new ArrayList<String>(Arrays.asList( "__terminate__" )); 
    relationshipMap.put("sourceAccount", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMap.put("destinationAccount", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMapObj = new RelationshipMap.Builder(x).setMap(relationshipMap).build();

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("transactionViewers")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;


    // TRANSACTION MAKER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    list = new ArrayList<String>(Arrays.asList( "__terminate__" )); 
    relationshipMap.put("sourceAccount", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMapObj = new RelationshipMap.Builder(x).setMap(relationshipMap).build();

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("transactionMakers")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;

    // TRANSACTION APPROVER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    list = new ArrayList<String>(Arrays.asList( "__terminate__" )); 
    relationshipMap.put("transactionApprovalRequest", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMapObj = new RelationshipMap.Builder(x).setMap(relationshipMap).build();

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("transactionApprovers")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;

    // ROLE ASSIGNER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    list = new ArrayList<String>(Arrays.asList( "__terminate__" )); 
    relationshipMap.put("sourceId", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMap.put("accountId", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMapObj = new RelationshipMap.Builder(x).setMap(relationshipMap).build();

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("roleAssignmentMakers")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;

    // ROLE ASSIGNMENT APPROVER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    list = new ArrayList<String>(Arrays.asList( "__terminate__" )); 
    relationshipMap.put("roleAssignmentApprovalRequest", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMapObj = new RelationshipMap.Builder(x).setMap(relationshipMap).build();

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("roleAssignmentApprovers")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;

    // ROLEASSIGNMENT TRUNCTIONDAO ROPE

    list = new ArrayList<String>(Arrays.asList( "roleAssignmentMakers" )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("roleAssignmentTrunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("accountId")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;


    // TRANSACTION MAKER JUNCTION DAO - ACCOUNT ROPE ***

    list = new ArrayList<String>(Arrays.asList( "roleAssignmentMakers" )); 
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionMakerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;


    // TRANSACTION APPROVER JUNCTION DAO - ACCOUNT ROPE ***

    list = new ArrayList<String>(Arrays.asList( "roleAssignmentMakers" )); 
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionApproverJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMapObj)          
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;


    // TRANSACTION VIEWER JUNCTION DAO - ACCOUNT ROPE ***
    
    list = new ArrayList<String>(Arrays.asList( "roleAssignmentMakers" )); 
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionViewerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;

    // ACCOUNT VIEWER JUNCTION DAO - ACCOUNT ROPE ***

    list = new ArrayList<String>(Arrays.asList( "roleAssignmentMakers" )); 
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountViewerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;

    // ACCOUNT MAKER JUNCTION DAO - ACCOUNT ROPE ***

    list = new ArrayList<String>(Arrays.asList( "roleAssignmentMakers" )); 
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountMakerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;

    // ACCOUNT APPROVER JUNCTION DAO - ACCOUNT ROPE ***

    list = new ArrayList<String>(Arrays.asList( "roleAssignmentMakers" )); 
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountApproverJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;

    // SOURCE ACCOUNT TRANSACTION ROPE


    list = new ArrayList<String>(Arrays.asList( "transactionMakers", "treasurers" )); 
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionDAO")
      .setCardinality("1:*")
      .setRelationshipKey("sourceAccount")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;

    // DESTINATION ACCOUNT TRANSACTION ROPE

    list = new ArrayList<String>(Arrays.asList( )); 
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    list = new ArrayList<String>(Arrays.asList( "transactionViewers" )); 
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMapObj = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionDAO")
      .setCardinality("1:*")
      .setRelationshipKey("destinationAccount")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear(); relationshipMapObj = null; crudMapObj = null;

    // composite rope ex.

    // ROPE transactionMakerROPE = ((List<ROPE>)((ArraySink)ropeDAO.inX(x).where(EQ(ROPE.RELATIONSHIP_KEY, "transactionMakers")).select(new ArraySink())).getArray()).get(0);
    // ROPE transactionViewerROPE = ((List<ROPE>)((ArraySink)ropeDAO.inX(x).where(EQ(ROPE.RELATIONSHIP_KEY, "transactionViewers")).select(new ArraySink())).getArray()).get(0);
    // ropeDAO.inX(x).put(new AndROPE.Builder(x)
    //   .setTargetDAOKey("accountDAO")
    //   .setRelationshipKey("treasurer")
    //   .setChildren( new ArrayList<ROPE>(Arrays.asList( transactionMakerROPE, transactionViewerROPE )))
    //   .build());
    // createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();
  }

  public void setupLiquidRootUserAndAccount(X x) {
    root = new User();
    root.setFirstName("root");
    root.setLastName("root");
    root.setId(11);
    root = (User) userDAO.put(root);

    rootAccount = new Account();
    rootAccount.setName("rootAccount");
    rootAccount.setId(101);
    rootAccount.setOwner(root.getId());
    rootAccount = (Account) accountDAO.put(rootAccount);

    aujunction = new AccountUserJunction();
    aujunction.setSourceId(rootAccount.getId());
    aujunction.setTargetId(root.getId());

    accountViewerJunctionDAO.put(aujunction); 
    accountMakerJunctionDAO.put(aujunction); 
    accountApproverJunctionDAO.put(aujunction);
    transactionViewerJunctionDAO.put(aujunction);
    transactionMakerJunctionDAO.put(aujunction); 
    transactionApproverJunctionDAO.put(aujunction);
    roleAssignmentApproverJunctionDAO.put(aujunction);
    roleAssignmentMakerJunctionDAO.put(aujunction);
  }

  public void addAccountPrivilegesToRoot(X x, User root, Account account) {
    aujunction = new AccountUserJunction();
    aujunction.setSourceId(account.getId());
    aujunction.setTargetId(root.getId());

    accountViewerJunctionDAO.put(aujunction); 
    accountMakerJunctionDAO.put(aujunction); 
    accountApproverJunctionDAO.put(aujunction);
    transactionViewerJunctionDAO.put(aujunction);
    transactionMakerJunctionDAO.put(aujunction); 
    transactionApproverJunctionDAO.put(aujunction);
    roleAssignmentApproverJunctionDAO.put(aujunction);
    roleAssignmentMakerJunctionDAO.put(aujunction);
  }

  public void setupBasicRoles(X x) {
    transactionViewerRole = (Role) roleDAO.inX(x).put(
      new Role.Builder(x)
        .setId(1)
        .setName("transactionViewer")
        .setJunctionDAOKey("transactionViewerJunctionDAO")
        .build()
    );
    transactionMakerRole = (Role) roleDAO.inX(x).put(
      new Role.Builder(x)
        .setId(2)
        .setName("transactionMaker")
        .setJunctionDAOKey("transactionMakerJunctionDAO")
        .build()
    );
    transactionApproverRole = (Role) roleDAO.inX(x).put(
      new Role.Builder(x)
        .setId(3)
        .setName("transactionApprover")
        .setJunctionDAOKey("transactionApproverJunctionDAO")
        .build()
    );
    accountViewerRole = (Role) roleDAO.inX(x).put(
      new Role.Builder(x)
        .setId(4)
        .setName("accountViewer")
        .setJunctionDAOKey("accountViewerJunctionDAO")
        .build()
    );
    accountMakerRole = (Role) roleDAO.inX(x).put(
      new Role.Builder(x)
        .setId(5)
        .setName("accountMaker")
        .setJunctionDAOKey("accountMakerJunctionDAO")
        .build()
    );
    accountApproverRole = (Role) roleDAO.inX(x).put(
      new Role.Builder(x)
        .setId(6)
        .setName("accountApprover")
        .setJunctionDAOKey("accountApproverJunctionDAO")
        .build()
    );
    roleAssignmentMakerRole = (Role) roleDAO.inX(x).put(
      new Role.Builder(x)
        .setId(7)
        .setName("roleAssignmentMaker")
        .setJunctionDAOKey("roleAssignmentMakerJunctionDAO")
        .build()
    );
    roleAssignmentApproverRole = (Role) roleDAO.inX(x).put(
      new Role.Builder(x)
        .setId(8)
        .setName("roleAssignmentApprover")
        .setJunctionDAOKey("roleAssignmentApproverJunctionDAO")
        .build()
    );

  }

}