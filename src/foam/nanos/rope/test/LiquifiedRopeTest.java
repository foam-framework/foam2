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

import static foam.mlang.MLang.*;

public class ROPETest extends Test {

  DAO userDAO, accountDAO, transactionDAO, approvalRequestDAO, ropeDAO;
  DAO accountViewerJunctionDAO, accountMakerJunctionDAO, accountApproverJunctionDAO, transactionViewerJunctionDAO, transactionMakerJunctionDAO, transactionApproverJunctionDAO, roleViewerJunctionDAO, roleMakerJunctionDAO, roleApproverJunctionDAO, ruleViewerJunctionDAO, ruleMakerJunctionDAO, ruleApproverJunctionDAO, userViewerJunctionDAO, userMakerJunctionDAO, userApproverJunctionDAO;

  User accountViewer, accountMaker, accountApprover, transactionViewer, transactionMaker, transactionApprover, roleViewer, roleMaker, roleApprover, root;
  Account rootAccount;
  AccountUserJunction aujunction;

  public void runTest(X x) {
    x = x.put("localUserDAO", new MDAO(User.getOwnClassInfo()));
    DAO easydao = new foam.dao.EasyDAO.Builder(x).setInnerDAO((DAO) x.get("localUserDAO")).setAuthorize(false).setOf(User.getOwnClassInfo()).build();
    x = x.put("userDAO", easydao);
    x = x.put("accountDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Account.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountDAO").build()).build());
    x = x.put("transactionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Transaction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionDAO").build()).build());
    x = x.put("approvalRequestDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(ApprovalRequest.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("approvalRequestDAO").build()).build());
    x = x.put("accountViewerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountViewerJunctionDAO").build()).build());
    x = x.put("accountMakerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountMakerJunctionDAO").build()).build());
    x = x.put("accountApproverJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountApproverJunctionDAO").build()).build());
    x = x.put("transactionViewerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionViewerJunctionDAO").build()).build());
    x = x.put("transactionMakerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionMakerJunctionDAO").build()).build());
    x = x.put("transactionApproverJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionApproverJunctionDAO").build()).build());
    x = x.put("roleViewerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("roleViewerJunctionDAO").build()).build());
    x = x.put("roleMakerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("roleMakerJunctionDAO").build()).build());
    x = x.put("roleApproverJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("roleApproverJunctionDAO").build()).build());    
    x = x.put("ruleViewerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("ruleViewerJunctionDAO").build()).build()); 
    x = x.put("ruleMakerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("ruleMakerJunctionDAO").build()).build());
    x = x.put("ruleApproverJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("ruleApproverJunctionDAO").build()).build());
    x = x.put("userViewerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("userViewerJunctionDAO").build()).build()); 
    x = x.put("userMakerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("userMakerJunctionDAO").build()).build());
    x = x.put("userApproverJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("userApproverJunctionDAO").build()).build());
    
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
    roleViewerJunctionDAO = (DAO) x.get("roleViewerJunctionDAO");
    roleMakerJunctionDAO = (DAO) x.get("roleMakerJunctionDAO");
    roleApproverJunctionDAO = (DAO) x.get("roleApproverJunctionDAO");
    ruleViewerJunctionDAO = (DAO) x.get("ruleViewerJunctionDAO");
    ruleMakerJunctionDAO = (DAO) x.get("ruleMakerJunctionDAO");
    ruleApproverJunctionDAO = (DAO) x.get("ruleApproverJunctionDAO");
    userViewerJunctionDAO = (DAO) x.get("userViewerJunctionDAO");
    userMakerJunctionDAO = (DAO) x.get("userMakerJunctionDAO");
    userApproverJunctionDAO = (DAO) x.get("userApproverJunctionDAO");
    DAO roleUserAccountTrunctionDAO = (DAO) x.get("roleUserAccountTrunctionDAO");
    
    setupLiquidROPEs(x);
    testLiquid(x);

  }

  public void testLiquid(X x) {

    setupLiquidRootUserAndAccount(x);

    x = x.put("user", root);

    test(((User) x.get("user")).getId() == 111, "context user is root test user. UserID = " + ((User) x.get("user")).getId());
    
    // test user without transactionmaker junction cannot put into transactiondao
    final Transaction t = new Transaction();
    t.setId("888");
    t.setSourceAccount(rootAccount.getId());
    t.setDestinationAccount(rootAccount.getId());

    transactionMaker = new User();
    transactionMaker.setFirstName("transaction");
    transactionMaker.setLastName("maker");
    transactionMaker.setId(222);
    transactionMaker = (User) userDAO.put(transactionMaker);
    final DAO tempTransactionDAO = (DAO) ((DAO) x.get("transactionDAO")).inX(x.put("user", transactionMaker));
    test(
      TestUtils.testThrows(
        () -> tempTransactionDAO.put(t),
        "You don't have permission to create this object",
        foam.nanos.auth.AuthorizationException.class
      ),
      "user without transactionmaker junction cannot put into transactiondao"
    );

    // test root user can put into transactiondao
    test((Transaction) transactionDAO.inX(x).put(t) != null, "root user can create Transaction" + t.getId());

    // test root user can create transactionmakerjunction for root account
    
    AccountUserJunction accountTransactionMakerJunction = new AccountUserJunction();
    accountTransactionMakerJunction.setSourceId(rootAccount.getId());
    accountTransactionMakerJunction.setTargetId(transactionMaker.getId());
    accountTransactionMakerJunction = (AccountUserJunction) transactionMakerJunctionDAO.inX(x).put(accountTransactionMakerJunction);
    test(accountTransactionMakerJunction != null, "root user can create transactionmaker" + accountTransactionMakerJunction.getId());

    // test root user can create transaction viewer junction for root account
    transactionViewer = new User();
    transactionViewer.setFirstName("transaction");
    transactionViewer.setLastName("viewer");
    transactionViewer.setId(333);
    transactionViewer = (User) userDAO.put(transactionViewer);

    AccountUserJunction accountTransactionViewerJunction = new AccountUserJunction();
    accountTransactionViewerJunction.setSourceId(rootAccount.getId());
    accountTransactionViewerJunction.setTargetId(transactionViewer.getId());
    accountTransactionViewerJunction = (AccountUserJunction) transactionViewerJunctionDAO.inX(x).put(accountTransactionViewerJunction);
    test(accountTransactionViewerJunction != null, "root user can create transactionviewer" + accountTransactionViewerJunction.getId());

    // test root user can create role maker junction for root account    
    roleMaker = new User();
    roleMaker.setFirstName("role");
    roleMaker.setLastName("maker");
    roleMaker.setId(444);
    roleMaker = (User) userDAO.put(roleMaker);

    AccountUserJunction accountRoleMakerJunction = new AccountUserJunction();
    accountRoleMakerJunction.setSourceId(rootAccount.getId());
    accountRoleMakerJunction.setTargetId(roleMaker.getId());
    accountRoleMakerJunction = (AccountUserJunction) roleMakerJunctionDAO.inX(x).put(accountRoleMakerJunction);
    test(accountRoleMakerJunction != null, "root user can create roleMaker" + accountRoleMakerJunction.getId());

    // put role maker as context user, test rolemaker create accountuserjunctions
    x.put("user", roleMaker);
    transactionApprover = new User();
    transactionApprover.setFirstName("transaction");
    transactionApprover.setLastName("approver");
    transactionApprover.setId(555);
    transactionApprover = (User) userDAO.put(transactionApprover);

    AccountUserJunction accountTransactionApproverJunction = new AccountUserJunction();
    accountTransactionApproverJunction.setSourceId(rootAccount.getId());
    accountTransactionApproverJunction.setTargetId(transactionApprover.getId());
    accountTransactionApproverJunction = (AccountUserJunction) transactionApproverJunctionDAO.inX(x).put(accountTransactionApproverJunction);
    test(accountTransactionApproverJunction != null, "rolemaker user can create transactionapprover" + accountTransactionApproverJunction.getId());

    accountMaker = new User();
    accountMaker.setFirstName("account");
    accountMaker.setLastName("maker");
    accountMaker.setId(666);
    accountMaker = (User) userDAO.put(accountMaker);
    AccountUserJunction accountAccountMakerJunction = new AccountUserJunction();
    accountAccountMakerJunction.setSourceId(rootAccount.getId());
    accountAccountMakerJunction.setTargetId(accountMaker.getId());
    accountAccountMakerJunction = (AccountUserJunction) accountMakerJunctionDAO.inX(x).put(accountAccountMakerJunction);
    test(accountAccountMakerJunction != null, "rolemaker user can create accountmaker" + accountAccountMakerJunction.getId());

    accountViewer = new User();
    accountViewer.setFirstName("account");
    accountViewer.setLastName("viewer");
    accountViewer.setId(777);
    accountViewer = (User) userDAO.put(accountViewer);
    AccountUserJunction accountAccountViewerJunction = new AccountUserJunction();
    accountAccountViewerJunction.setSourceId(rootAccount.getId());
    accountAccountViewerJunction.setTargetId(accountViewer.getId());
    accountAccountViewerJunction = (AccountUserJunction) accountViewerJunctionDAO.inX(x).put(accountAccountViewerJunction);
    test(accountAccountViewerJunction != null, "rolemaker user can create accountViewer" + accountAccountViewerJunction.getId());

    accountApprover = new User();
    accountApprover.setFirstName("account");
    accountApprover.setLastName("approver");
    accountApprover.setId(888);
    accountApprover = (User) userDAO.put(accountApprover);
    AccountUserJunction accountAccountApproverJunction = new AccountUserJunction();
    accountAccountApproverJunction.setSourceId(rootAccount.getId());
    accountAccountApproverJunction.setTargetId(accountApprover.getId());
    accountAccountApproverJunction = (AccountUserJunction) accountApproverJunctionDAO.inX(x).put(accountAccountApproverJunction);
    test(accountAccountApproverJunction != null, "rolemaker user can create accountApprover" + accountAccountApproverJunction.getId());

    roleApprover = new User();
    roleApprover.setFirstName("role");
    roleApprover.setLastName("approver");
    roleApprover.setId(999);
    roleApprover = (User) userDAO.put(roleApprover);
    AccountUserJunction accountRoleApproverJunction = new AccountUserJunction();
    accountRoleApproverJunction.setSourceId(rootAccount.getId());
    accountRoleApproverJunction.setTargetId(roleApprover.getId());
    accountRoleApproverJunction = (AccountUserJunction) roleApproverJunctionDAO.inX(x).put(accountRoleApproverJunction);
    test(accountRoleApproverJunction != null, "rolemaker user can create roleApprover" + accountRoleApproverJunction.getId());


    roleViewer = new User();
    roleViewer.setFirstName("role");
    roleViewer.setLastName("viewer");
    roleViewer.setId(101010);
    roleViewer = (User) userDAO.put(roleViewer);
    AccountUserJunction accountRoleViewerJunction = new AccountUserJunction();
    accountRoleViewerJunction.setSourceId(rootAccount.getId());
    accountRoleViewerJunction.setTargetId(roleViewer.getId());
    accountRoleViewerJunction = (AccountUserJunction) roleViewerJunctionDAO.inX(x).put(accountRoleViewerJunction);
    test(accountRoleViewerJunction != null, "rolemaker user can create roleViewer" + accountRoleViewerJunction.getId());

    // test account maker create child account
    Account childAccount1 = new Account();
    childAccount1.setId(222);
    childAccount1.setParent(rootAccount.getId());
    childAccount1 = (Account) accountDAO.inX(x.put("user", accountMaker)).put(childAccount1);
    test(childAccount1 != null, "accountmaker user can create direct child account under account in which they are accountmaker of");


    // test transaction viewer cannot create transaction 
    final Transaction t1 = new Transaction();
    t1.setId("999");
    t1.setSourceAccount(rootAccount.getId());
    t1.setDestinationAccount(rootAccount.getId());
    final DAO tempTransactionDAO2 = tempTransactionDAO.inX(x.put("user", transactionViewer));
    test(
      TestUtils.testThrows(
        () -> tempTransactionDAO2.put(t1),
        "You don't have permission to create this object",
        foam.nanos.auth.AuthorizationException.class
      ),
      "transactionViewer cannot create transaction"
    );

    // test transaction maker can create transaction
    x = x.put("user", transactionMaker);
    Transaction returnedt1 = (Transaction) transactionDAO.inX(x).put(t1);
    test(returnedt1 != null, "transactionMaker user can create Transaction" + returnedt1.getId());

    // test transaction viewer can view transaction
    x = x.put("user", transactionViewer);
    Transaction viewedTransaction = (Transaction) transactionDAO.inX(x).find(returnedt1.getId());
    test(viewedTransaction != null, "transactionViewer user can view transaction");

  }

  public void setupLiquidROPEs(X x) {
    List<String> list = new ArrayList<String>();
    Map<String, List<String>> createMap = new HashMap<String, NextRelationshipsList>();
    Map<String, List<String>> readMap = new HashMap<String, NextRelationshipsList>();
    Map<String, List<String>> updateMap = new HashMap<String, NextRelationshipsList>();
    Map<String, List<String>> deleteMap = new HashMap<String, NextRelationshipsList>();
    Map<String, List<String>> relationshipMap = new HashMap<String, NextRelationshipsList>();
    CRUDMap crudMapObj;
    RelationshipMap relationshipMapObj;

    // PARENT CHILD ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "accountMakers", "accountViewers" ));
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    list = new ArrayList<String>(Arrays.asList( "accountMakers" )); 
    createMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    updateMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    deleteMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMap = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    relationshipMapObj = new RelationshipMap.Builder(x).setMap(null).build();

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("1:*")
      .setRelationshipKey("parent")
      .setCrudMap(crudMapObj)           
      .setRelationshipMap(relationshipMapObj)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // ACCOUNT VIEWER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts, but can read it
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList("__terminate__"));
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMap = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
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

    // ACCOUNT MAKER ROPE 
        
    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts, but can read it
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList("__terminate__"));
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMap = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // ACCOUNT APPROVER ROPE


    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts, but can read it
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList("__terminate__"));
    readMap.put("__default__", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    crudMap = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    relationshipMap.put("parent", new NextRelationshipsList.Builder(x).setNextRelationships(list).build());
    relationshipMapObj = new RelationshipMap.Builder(x).setMap(relationshipMap).build();
        
    list = new ArrayList<String>(Arrays.asList( )); // users should not cud top-level accounts, users should be able to read tho TODO
    createMap.put("__default__", list);
    readMap.put("__default__", new ArrayList<String>(Arrays.asList( "__terminate__" )));
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    relationshipMap.put("accountApprovalRequest", new ArrayList<String>(Arrays.asList( "__terminate__" ))); // TODO to be implemented in approvalrequest custom auth

    ropeDAO.inX(x).put(
      new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("accountApprovers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();


    // TRANSACTION VIEWER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    relationshipMap.put("sourceAccount", new ArrayList<String>(Arrays.asList( "__terminate__" )));
    relationshipMap.put("destinationAccount", new ArrayList<String>(Arrays.asList( "__terminate__" )));

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("transactionViewers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();


    // TRANSACTION MAKER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    relationshipMap.put("sourceAccount", new ArrayList<String>(Arrays.asList( "__terminate__" )));

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("transactionMakers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // TRANSACTION APPROVER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    relationshipMap.put("transactionApprovalRequest", new ArrayList<String>(Arrays.asList( "__terminate__" ))); // TODO to be implemented in approval request custom auth

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("transactionApprovers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // ACCOUNT ROLE VIEWER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // TODO
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    relationshipMap.put("sourceId", new ArrayList<String>(Arrays.asList( "__terminate__" )));  // sourceId is accountId in AccountUserJunction

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("roleViewers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // ACCOUNT ROLE MAKER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts, but can read it
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap = new CRUDMap.Builder(x).setCreate(createMap).setRead(readMap).setUpdate(updateMap).setDelete(deleteMap).build();
    relationshipMap.put("sourceId", new ArrayList<String>(Arrays.asList( "__terminate__" ))); // sourceId is accountId in AccountUserJunction

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("roleMakers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // ACCOUNT ROLE APPROVER ROPE

    list = new ArrayList<String>(Arrays.asList( )); 
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    relationshipMap.put("sourceId", new ArrayList<String>(Arrays.asList( "__terminate__" ))); // sourceId is accountId in AccountUserJunction

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("roleApprovers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // TRANSACTION MAKER JUNCTION DAO - ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionMakerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();


    // TRANSACTION APPROVER JUNCTION DAO - ACCOUNT ROPE
    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionApproverJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)          
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();


    // TRANSACTION VIEWER JUNCTION DAO - ACCOUNT ROPE
    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionViewerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // ACCOUNT VIEWER JUNCTION DAO - ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountViewerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // ACCOUNT MAKER JUNCTION DAO - ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountMakerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // ACCOUNT APPROVER JUNCTION DAO - ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountApproverJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // ROLE VIEWER JUNCTION DAO - ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("roleViewerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // ROLE APPROVERJUNCTION DAO - ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("roleApproverJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // ROLE MAKER JUNCTION DAO - ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("roleMakerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // RULE VIEWER JUNCTION DAO - ACCOUNT ROPE 

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("ruleViewerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // RULE APPROVERJUNCTION DAO - ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("ruleApproverJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // RULE MAKER JUNCTION DAO - ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("ruleMakerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // USER VIEWER JUNCTION DAO - ACCOUNT ROPE 

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("userViewerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // USER APPROVER JUNCTION DAO - ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("userApproverJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // USER MAKER JUNCTION DAO - ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "roleMakers" )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("ruleMakerJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // SOURCE ACCOUNT TRANSACTION ROPE

    list = new ArrayList<String>(Arrays.asList( "transactionMakers", "treasurer" ));
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionDAO")
      .setCardinality("1:*")
      .setRelationshipKey("sourceAccount")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // DESTINATION ACCOUNT TRANSACTION ROPE
    list = new ArrayList<String>(Arrays.asList( )); 
    createMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList( "transactionViewers" )); 
    readMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    
    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionDAO")
      .setCardinality("1:*")
      .setRelationshipKey("destinationAccount")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();

    // composite rope ex.

    ROPE transactionMakerROPE = ((List<ROPE>)((ArraySink)ropeDAO.inX(x).where(EQ(ROPE.RELATIONSHIP_KEY, "transactionMakers")).select(new ArraySink())).getArray()).get(0);
    ROPE transactionViewerROPE = ((List<ROPE>)((ArraySink)ropeDAO.inX(x).where(EQ(ROPE.RELATIONSHIP_KEY, "transactionViewers")).select(new ArraySink())).getArray()).get(0);
    ropeDAO.inX(x).put(new AndROPE.Builder(x)
      .setTargetDAOKey("accountDAO")
      .setRelationshipKey("treasurer")
      .setChildren( new ArrayList<ROPE>(Arrays.asList( transactionMakerROPE, transactionViewerROPE )))
      .build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); relationshipMap.clear();





  }

  public void setupLiquidRootUserAndAccount(X x) {

    root = new User();
    root.setFirstName("root");
    root.setLastName("root");
    root.setId(111);
    root = (User) userDAO.put(root);
    test(root != null, "root user created");

    rootAccount = new Account();
    rootAccount.setName("rootAccount");
    rootAccount.setId(111);
    rootAccount.setOwner(root.getId());
    rootAccount = (Account) accountDAO.put(rootAccount);
    test(rootAccount != null, "root account created");

    aujunction = new AccountUserJunction();
    aujunction.setSourceId(rootAccount.getId());
    aujunction.setTargetId(root.getId());

    accountViewerJunctionDAO.put(aujunction); 
    accountMakerJunctionDAO.put(aujunction); 
    accountApproverJunctionDAO.put(aujunction);
    transactionViewerJunctionDAO.put(aujunction);
    transactionMakerJunctionDAO.put(aujunction); 
    transactionApproverJunctionDAO.put(aujunction);
    roleViewerJunctionDAO.put(aujunction);
    roleMakerJunctionDAO.put(aujunction);
    roleApproverJunctionDAO.put(aujunction);
  }


}