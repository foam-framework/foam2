/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.rope.test;

import java.util.Map;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.nanos.rope.ROPE;
import foam.nanos.auth.User;
import net.nanopay.model.Business;
import net.nanopay.contacts.Contact;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;
import net.nanopay.approval.ApprovalRequest;
import foam.nanos.theme.Theme;
import foam.nanos.auth.Group;
import foam.nanos.auth.Permission;

public class ROPETest extends Test {

  DAO userDAO, businessDAO, contactDAO, accountDAO, transactionDAO, approvalRequestDAO, themeDAO, groupDAO, permissionDAO, ropeDAO;

  public void runTest(X x) {
    
    x = x.put("userDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(User.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "userDAO")).build());
    x = x.put("businessDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Business.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "businessDAO")).build());
    x = x.put("contactDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Contact.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "contactDAO")).build());
    x = x.put("accountDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Account.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "accountDAO")).build());
    x = x.put("transactionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Transaction.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "transactionDAO")).build());
    x = x.put("approvalRequestDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(ApprovalRequest.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "approvalRequestDAO")).build());
    x = x.put("themeDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Theme.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "themeDAO")).build());
    x = x.put("groupDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Group.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "groupDAO")).build());
    x = x.put("permissionDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(Permission.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "permissionDAO")).build());
    x = x.put("ropeDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x).setDelegate(new MDAO(ROPE.getOwnClassInfo())).setAuthorizer(new foam.nanos.rope.ROPEAuthorizer(x, "ropeDAO")).build());

    userDAO = (DAO) x.get("userDAO");
    businessDAO = (DAO) x.get("businessDAO");
    contactDAO = (DAO) x.get("contactDAO");
    accountDAO = (DAO) x.get("accountDAO");
    transactionDAO = (DAO) x.get("transactionDAO");
    approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
    themeDAO = (DAO) x.get("themeDAO");
    groupDAO = (DAO) x.get("groupDAO");
    permissionDAO = (DAO) x.get("permissionDAO");
    ropeDAO = (DAO) x.get("ropeDAO");
    
    setupROPEs(x);
  }

  public void setupROPEs(X x) {
    Map<String, Map<String, List<String>>> crudMap;
    Map<String, List<String>> relationshipMap;

//   sourceModel: 'foam.nanos.auth.User',
//   targetModel: 'net.nanopay.account.Account',
//   forwardName: 'accounts',
//   inverseName: 'owner',
//   cardinality: '1:*',
//   sourceDAOKey: 'userDAO',
//   unauthorizedSourceDAOKey: 'localUserDAO',
//   targetDAOKey: 'accountDAO',
//   unauthorizedTargetDAOKey: 'localAccountDAO',
    crudMap = null;
    relationshipMap = null;
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("1:*")
      .setRelationshipKey("accounts")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(false));
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("userDAO")
      .setCardinality("1:*")
      .setRelationshipKey("owner")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(true));



//   sourceModel: 'net.nanopay.model.Business',
//   targetModel: 'foam.nanos.auth.User',
//   cardinality: '*:*',
//   forwardName: 'signingOfficers',
//   inverseName: 'businessesInWhichThisUserIsASigningOfficer',
//   sourceProperty: {
//     createMode: 'HIDDEN',
//     section: 'business'
//   },
//   targetProperty: { hidden: true },
//   junctionDAOKey: 'signingOfficerJunctionDAO'
    crudMap = null;
    relationshipMap = null;
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("businessDAO")
      .setTargetDAOKey("userDAO")
      .setCardinality("*:*")
      .setRelationshipKey("signingOfficers")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(false));
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("businessDAO")
      .setCardinality("*:*")
      .setRelationshipKey("businessesInWhichThisUserIsASigningOfficer")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(true));


//   sourceModel: 'net.nanopay.account.Account',
//   targetModel: 'net.nanopay.tx.model.Transaction',
//   forwardName: 'debits',
//   inverseName: 'sourceAccount',
//   cardinality: '1:*',
//   sourceDAOKey: 'accountDAO',
//   unauthorizedSourceDAOKey: 'localAccountDAO',
//   targetDAOKey: 'transactionDAO',
//   unauthorizedTargetDAOKey: 'localTransactionDAO',
    crudMap = null;
    relationshipMap = null;
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionDAO")
      .setCardinality("1:*")
      .setRelationshipKey("debits")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(false));
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("transactionDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("1:*")
      .setRelationshipKey("sourceAccount")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(true));



//   sourceModel: 'net.nanopay.account.Account',
//   targetModel: 'net.nanopay.tx.model.Transaction',
//   forwardName: 'credits',
//   inverseName: 'destinationAccount',
//   cardinality: '1:*',
//   sourceDAOKey: 'accountDAO',
//   unauthorizedSourceDAOKey: 'localAccountDAO',
//   targetDAOKey: 'transactionDAO',
//   unauthorizedTargetDAOKey: 'localTransactionDAO',
    crudMap = null;
    relationshipMap = null;
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("accountDAO")
      .setTargetDAOKey("transactionDAO")
      .setCardinality("1:*")
      .setRelationshipKey("credits")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(false));
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("transactionDAO")
      .setTargetDAOKey("accountDAO")
      .setCardinality("1:*")
      .setRelationshipKey("destinationAccount")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(true));



//   sourceModel: 'foam.nanos.auth.User',
//   targetModel: 'net.nanopay.approval.ApprovalRequest',
//   forwardName: 'approvalRequests',
//   inverseName: 'entityId',
//   cardinality: '1:*',
//   sourceDAOKey: 'userDAO',
//   unauthorizedSourceDAOKey: 'localUserDAO',
//   targetDAOKey: 'approvalRequestDAO',
    crudMap = null;
    relationshipMap = null;
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("approvalRequestDAO")
      .setCardinality("1:*")
      .setRelationshipKey("approvalRequests")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(false));
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("approvalRequestDAO")
      .setTargetDAOKey("userDAO")
      .setCardinality("1:*")
      .setRelationshipKey("entityId")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(true));


//   cardinality: '*:*',
//   sourceModel: 'foam.nanos.auth.Group',
//   targetModel: 'foam.nanos.auth.Permission',
//   forwardName: 'permissions',
//   inverseName: 'groups',
//   junctionDAOKey: 'groupPermissionJunctionDAO'
    crudMap = null;
    relationshipMap = null;
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("groupDAO")
      .setTargetDAOKey("permissionDAO")
      .setCardinality("*:*")
      .setRelationshipKey("permissions")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(false));
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("permissionDAO")
      .setTargetDAOKey("groupDAO")
      .setCardinality("*:*")
      .setRelationshipKey("groups")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(true));



//   sourceModel: 'foam.nanos.theme.Theme',
//   targetModel: 'foam.nanos.auth.User',
//   cardinality: '1:*',
//   forwardName: 'users',
//   inverseName: 'personalTheme',
    crudMap = null;
    relationshipMap = null;
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("themeDAO")
      .setTargetDAOKey("userDAO")
      .setCardinality("1:*")
      .setRelationshipKey("users")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(false));
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("themeDAO")
      .setCardinality("1:*")
      .setRelationshipKey("personalTheme")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(true));


    

//   cardinality: '1:*',
//   package: 'net.nanopay.auth',
//   sourceModel: 'foam.nanos.auth.User',
//   targetModel: 'net.nanopay.contacts.Contact',
//   forwardName: 'contacts',
//   inverseName: 'owner',
//   targetDAOKey: 'contactDAO',
//   unauthorizedTargetDAOKey: 'localContactDAO',
    crudMap = null;
    relationshipMap = null;
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("userDAO")
      .setTargetDAOKey("contactDAO")
      .setCardinality("1:*")
      .setRelationshipKey("contacts")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(false));
    ropeDAO_.inX(getX()).put(new ROPE()
      .setSourceDAOKey("contactDAO")
      .setTargetDAOKey("userDAO")
      .setCardinality("1:*")
      .setRelationshipKey("owner")
      .setCrudMap(crudMap)           // java.util.Map<String, java.util.Map<String, java.util.List<String>>>
      .setRelationshipMap(relationshipMap)   // java.util.Map<String, java.util.List<String>>
      .setIsInverse(true));
  }

}