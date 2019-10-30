/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
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
  DAO accountViewerJunctionDAO, accountMakerJunctionDAO, accountApproverJunctionDAO, transactionViewerJunctionDAO, transactionMakerJunctionDAO, transactionApproverJunctionDAO, roleViewerJunctionDAO, roleMakerJunctionDAO, roleApproverJunctionDAO;

  User accountViewer, accountMaker, accountApprover, transactionViewer, transactionMaker, transactionApprover, roleViewer, roleMaker, roleApprover, root;
  Account rootAccount;
  AccountUserJunction aujunction;

  public void runTest(X x) {
    
    x = x.put("userDAO", new MDAO(User.getOwnClassInfo()));
    x = x.put("accountDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Account.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountDAO").build()).build());
    x = x.put("transactionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Transaction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionDAO").build()).build());
    x = x.put("approvalRequestDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(ApprovalRequest.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("approvalRequestDAO").build()).build());
    x = x.put("ropeDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(ROPE.getOwnClassInfo())).setAuthorizer(new foam.nanos.auth.GlobalReadAuthorizer("ropeDAO")).build());
    x = x.put("accountViewerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountViewerJunctionDAO").build()).build());
    x = x.put("accountMakerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountMakerJunctionDAO").build()).build());
    x = x.put("accountApproverJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("accountApproverJunctionDAO").build()).build());
    x = x.put("transactionViewerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionViewerJunctionDAO").build()).build());
    x = x.put("transactionMakerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionMakerJunctionDAO").build()).build());
    x = x.put("transactionApproverJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("transactionApproverJunctionDAO").build()).build());
    x = x.put("roleViewerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("roleViewerJunctionDAO").build()).build());
    x = x.put("roleMakerJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("roleMakerJunctionDAO").build()).build());
    x = x.put("roleApproverJunctionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(AccountUserJunction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer.Builder(x).setTargetDAOKey("roleApproverJunctionDAO").build()).build());
    
        
    userDAO = (DAO) x.get("userDAO");
    accountDAO = (DAO) x.get("accountDAO");
    transactionDAO = (DAO) x.get("transactionDAO");
    approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
    ropeDAO = (DAO) x.get("ropeDAO");
    accountViewerJunctionDAO = (DAO) x.get("accountViewerJunctionDAO");
    accountMakerJunctionDAO = (DAO) x.get("accountMakerJunctionDAO");
    accountApproverJunctionDAO = (DAO) x.get("accountApproverJunctionDAO");
    transactionViewerJunctionDAO = (DAO) x.get("transactionViewerJunctionDAO");
    transactionMakerJunctionDAO = (DAO) x.get("transactionMakerJunctionDAO");
    transactionApproverJunctionDAO = (DAO) x.get("transactionApproverJunctionDAO");
    roleViewerJunctionDAO = (DAO) x.get("roleViewerJunctionDAO");
    roleMakerJunctionDAO = (DAO) x.get("roleMakerJunctionDAO");
    roleApproverJunctionDAO = (DAO) x.get("roleApproverJunctionDAO");
    
    setupROPEs(x);
    setupRootUserAndAccount(x);
  }

  public void setupRootUserAndAccount(X x) {

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
    
    accountMakerJunctionDAO.put(aujunction); 
    accountViewerJunctionDAO.put(aujunction); 
    transactionMakerJunctionDAO.put(aujunction); 
    transactionViewerJunctionDAO.put(aujunction);
    roleMakerJunctionDAO.put(aujunction);


    x = x.put("user", root);

    test(((User) x.get("user")).getId() == 111, "context user is root test user. UserID = " + ((User) x.get("user")).getId());
    
    // test root user create transaction
    Transaction t = new Transaction();
    t.setId("888");
    t.setSourceAccount(rootAccount.getId());
    t.setDestinationAccount(rootAccount.getId());

    t = (Transaction) transactionDAO.inX(x).put(t);
    test(t != null, "root user can create Transaction" + t.getId());

    // test root user can create transactionmakerjunction for root account
    transactionMaker = new User();
    transactionMaker.setFirstName("transaction");
    transactionMaker.setLastName("maker");
    transactionMaker.setId(222);
    transactionMaker = (User) userDAO.put(transactionMaker);
    
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

    // test transaction viewer cannot create transaction 
    final Transaction t1 = new Transaction();
    t1.setId("999");
    t1.setSourceAccount(rootAccount.getId());
    t1.setDestinationAccount(rootAccount.getId());

    x = x.put("user", transactionViewer);
    final DAO tempTransactionDAO = (DAO) ((DAO) x.get("transactionDAO")).inX(x);
    test(
      TestUtils.testThrows(
        () -> tempTransactionDAO.put(t1),
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

  public void setupROPEs(X x) {
    List<String> list = new ArrayList<String>();
    Map<String, List<String>> createMap = new HashMap<String, List<String>>();
    Map<String, List<String>> readMap = new HashMap<String, List<String>>();
    Map<String, List<String>> updateMap = new HashMap<String, List<String>>();
    Map<String, List<String>> deleteMap = new HashMap<String, List<String>>();
    Map<String, Map<String, List<String>>> crudMap = new HashMap<String, Map<String, List<String>>>();
    Map<String, List<String>> relationshipMap = new HashMap<String, List<String>>();

    // PARENT CHILD ACCOUNT ROPE

    list = new ArrayList<String>(Arrays.asList( "accountMakers" )); // if cascading add "parent"
    createMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList( "accountMakers", "accountViewers" ));
    readMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList( "accountMakers" ));
    updateMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList( "accountMakers" ));
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("1:*")
      .setRelationshipKey("parent")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

    // ACCOUNT VIEWER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts, but can read it
    createMap.put("__default__", list);
    readMap.put("__default__", new ArrayList<String>(Arrays.asList( "__terminate__" )));
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("accountViewers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

    // ACCOUNT MAKER ROPE 
        
    list = new ArrayList<String>(Arrays.asList( )); // users should not cud top-level accounts, users should be able to read
    createMap.put("__default__", list);
    readMap.put("__default__", new ArrayList<String>(Arrays.asList( "__terminate__" )));
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);

    ropeDAO.inX(x).put(
      new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("accountMakers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

    // ACCOUNT APPROVER ROPE
        
    list = new ArrayList<String>(Arrays.asList( )); // users should not cud top-level accounts, users should be able to read tho TODO
    createMap.put("__default__", list);
    readMap.put("__default__", new ArrayList<String>(Arrays.asList( "__terminate__" )));
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    relationshipMap.put("accountApprovalRequest", new ArrayList<String>(Arrays.asList( " __terminate__" ))); // TODO to be implemented in approvalrequest custom auth

    ropeDAO.inX(x).put(
      new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("accountApprovers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();


    // TRANSACTION VIEWER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();


    // TRANSACTION MAKER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    relationshipMap.put("sourceAccount", new ArrayList<String>(Arrays.asList( "__terminate__" )));

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("transactionMakers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();


    // TRANSACTION APPROVER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    relationshipMap.put("transactionApprovalRequest", new ArrayList<String>(Arrays.asList( "__terminate__" ))); // TODO to be implemented in approval request custom auth

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("transactionApprovers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

    // ACCOUNT ROLE VIEWER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // TODO
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    relationshipMap.put("sourceId", new ArrayList<String>(Arrays.asList( "__terminate__" )));  // sourceId is accountId in AccountUserJunction

    ropeDAO.inX(x).put(new ROPE.Builder(x)
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("roleViewers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

    // ACCOUNT ROLE MAKER ROPE

    list = new ArrayList<String>(Arrays.asList( )); // users should never be able to modify/create top-level accounts, but can read it
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
      .setRelationshipKey("roleMakers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(true).build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();


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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();


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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

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
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

    // composite rope ex.

    ROPE transactionMakerROPE = ((List<ROPE>)((ArraySink)ropeDAO.inX(x).where(EQ(ROPE.RELATIONSHIP_KEY, "transactionMakers")).select(new ArraySink())).getArray()).get(0);
    ROPE transactionViewerROPE = ((List<ROPE>)((ArraySink)ropeDAO.inX(x).where(EQ(ROPE.RELATIONSHIP_KEY, "transactionViewers")).select(new ArraySink())).getArray()).get(0);
    ropeDAO.inX(x).put(new AndROPE.Builder(x)
      .setTargetDAOKey("accountDAO")
      .setRelationshipKey("treasurer")
      .setCompositeRopes( new ArrayList<ROPE>(Arrays.asList( transactionMakerROPE, transactionViewerROPE )))
      .build());
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();





  }


}