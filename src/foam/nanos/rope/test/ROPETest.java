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

import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.nanos.rope.ROPE;
import net.nanopay.approval.ApprovalRequest;

public class ROPETest extends Test {

  DAO userDAO, accountDAO, transactionDAO, approvalRequestDAO, ropeDAO;

  public void runTest(X x) {
    
    x = x.put("userDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(User.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "userDAO")).build());
    x = x.put("accountDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Account.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "accountDAO")).build());
    x = x.put("transactionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Transaction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "transactionDAO")).build());
    x = x.put("approvalRequestDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(ApprovalRequest.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "approvalRequestDAO")).build());
    x = x.put("ropeDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(ROPE.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "ropeDAO")).build());

    userDAO = (DAO) x.get("userDAO");
    accountDAO = (DAO) x.get("accountDAO");
    transactionDAO = (DAO) x.get("transactionDAO");
    approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
    ropeDAO = (DAO) x.get("ropeDAO");
    
    setupROPEs(x);
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

    // ACCOUNT MAKER ROPE
    //   sourceModel: 'net.nanopay.account.Account',
    //   targetModel: 'net.nanopay.account.Account',
    //   forwardName: 'children',
    //   inverseName: 'parent',
    //   cardinality: '1:*',
    //   sourceDAOKey: 'accountDAO',
    //   targetDAOKey: 'accountDAO',
        
    // account makers can CRUD accounts
    list = new ArrayList<String>(Arrays.asList( "accountMaker" )); // if cascading add "parent"
    createMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList( "accountMaker, accountViewer, accountApprover" ));
    readMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList( "accountMaker" ));
    updateMap.put("__default__", list);
    list = new ArrayList<String>(Arrays.asList( "accountMaker" ));
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    relationshipMap.put("sourceAccount", new ArrayList<String>(Arrays.asList( "transactionMaker" )));
    relationshipMap.put("destinationAccount", new ArrayList<String>());

    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("parent")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false));
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

    //   sourceModel: 'foam.nanos.auth.User',
    //   targetModel: 'net.nanopay.account.Account',
    //   forwardName: 'accountsMadeBy',
    //   inverseName: 'accountMakers',
    //   cardinality: '*:*',
    //   sourceDAOKey: 'userDAO',
    //   targetDAOKey: 'accountDAO',
        
    // account makers can CRUD accounts
    list = new ArrayList<String>(Arrays.asList( "__terminate__" ));
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);
    relationshipMap.put("parent", new ArrayList<String>(Arrays.asList( "accountMakers" )));

    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("accountMakers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false));
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

    list = new ArrayList<String>(Arrays.asList( "__terminate__" ));
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);

    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountMakerAccountJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("sourceId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false));
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

    list = new ArrayList<String>(Arrays.asList( "__terminate__" ));
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);

    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("accountMakerAccountJunctionDAO")
      .setCardinality("1:1")
      .setRelationshipKey("targetId")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false));
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

    // TRANSACTION MAKER ROPE

    //   sourceModel: 'net.nanopay.auth.User',
    //   targetModel: 'foam.nanos.tx.model.Transaction',
    //   cardinality: '*:*',
    //   forwardName: 'transactionsMadeBy',
    //   inverseName: 'transactionMakers',
    //   sourceDAOKey: 'userDAO'
    //   targetDAOKey: 'transactionDAO'

    list = new ArrayList<String>(Arrays.asList( "__terminate__" ));
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);

    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("transactionDAO")
      .setCardinality("*:*")
      .setRelationshipKey("transaction<akers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false));
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();

    // ACCOUNT VIEWER ROPE

    //   sourceModel: 'foam.nanos.auth.User',
    //   targetModel: 'net.nanopay.account.Account',
    //   forwardName: 'accountsViewedBy',
    //   inverseName: 'accountViewers',
    //   cardinality: '*:*',
    //   sourceDAOKey: 'userDAO',
    //   targetDAOKey: 'accountDAO',

    list = new ArrayList<String>(Arrays.asList( "__terminate__" ));
    createMap.put("__default__", list);
    readMap.put("__default__", list);
    updateMap.put("__default__", list);
    deleteMap.put("__default__", list);
    crudMap.put("create", createMap);
    crudMap.put("read", readMap);
    crudMap.put("update", updateMap);
    crudMap.put("delete", deleteMap);

    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("*:*")
      .setRelationshipKey("accountViewers")
      .setCrudMap(crudMap)           
      .setRelationshipMap(relationshipMap)   
      .setIsInverse(false));
    createMap.clear(); readMap.clear(); updateMap.clear(); deleteMap.clear(); crudMap.clear(); relationshipMap.clear();
  }

}