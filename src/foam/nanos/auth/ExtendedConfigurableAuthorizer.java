/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthorizationException;
import foam.mlang.predicate.Predicate;
import foam.dao.AbstractSink;
import foam.core.Detachable;
import foam.dao.ArraySink;
import java.util.ArrayList;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.IN;

public class ExtendedConfigurableAuthorizer implements Authorizer {

  // Configurable authorizer allowing the use of configurable permissions templates defined in permissionTemplateReferenceDAO. 
  // Template references a DAOKey array detailing when to apply to authorizer.
  // Allows for grouped object access based on object values and templates configured.
  // Please see PermissionTemplateReference.js for additional documentation

  protected String daoKey_ = "";

  public ExtendedConfigurableAuthorizer(String daoKey) {
    daoKey_ = daoKey;
  }

  public String createPermission(PermissionTemplateReference permissionTemplate, FObject obj) {
    // Construct permission from permission template reference.
    String permission = daoKey_ + "." + permissionTemplate.getOperation();
    for (String prop : permissionTemplate.getProperties()) {
      permission += "." + obj.getProperty(prop);
    }
    return permission;
  }

  public void checkPermissionTemplates(X x, String op, FObject obj) {
    AuthService authService = (AuthService) x.get("auth");
    DAO permissionTemplateDAO = (DAO) x.get("permissionTemplateReferenceDAO");

    Predicate predicate = (Predicate) AND(
      IN(daoKey_, PermissionTemplateReference.DAO_KEYS),
      EQ(PermissionTemplateReference.OPERATION, op)
    );

    ArraySink permissionTemplates = (ArraySink) permissionTemplateDAO.where(predicate).select(new AbstractSink(){
      public void put(Object o, Detachable d) {
        String permission = createPermission((PermissionTemplateReference) o, obj);
        if ( ! authService.check(x, permission) ) {
          ((foam.nanos.logger.Logger) x.get("logger")).debug("ExtendedConfigurableAuthorizer", "Permission denied", permission);
          throw new AuthorizationException();
        }
      }
    });
  }

  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {
    checkPermissionTemplates(x, "create", obj);
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    checkPermissionTemplates(x, "read", obj);
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {
    checkPermissionTemplates(x, "update", oldObj);
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
    checkPermissionTemplates(x, "remove", obj);
  }

  public boolean checkGlobalRead(X x, Predicate predicate) {
    String permission = daoKey_ + ".read.*";
    AuthService authService = (AuthService) x.get("auth");
    try {
      return authService.check(x, permission);
    } catch ( AuthorizationException e ) {
      return false;
    }
  }

  public boolean checkGlobalRemove(X x) {
    String permission = daoKey_ + ".remove.*";
    AuthService authService = (AuthService) x.get("auth");
    try {
      return authService.check(x, permission);
    } catch ( AuthorizationException e ) {
      return false;
    }

  }
}
