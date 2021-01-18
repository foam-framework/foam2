/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthorizationException;
import foam.mlang.predicate.Predicate;
import foam.dao.AbstractSink;
import foam.core.Detachable;
import foam.dao.ArraySink;
import java.util.ArrayList;

public class ExtendedConfigurableAuthorizer implements Authorizer {

  // Configurable authorizer allowing the use of configurable permissions templates defined in permissionTemplateReferenceDAO. 
  // Template reference a DAOKey array detailing when to apply to authorizer.
  // Allows for grouped object access based on object values and templates configured.
  // Please see PermissionTemplateReference.js for additional documentation

  protected String daoKey_ = "";

  public ExtendedConfigurableAuthorizer(String daoKey) {
    daoKey_ = daoKey;
  }

  public String createPermission(PermissionTemplateReference permissionTemplate, Object object) {
    // Construct permission from permission template reference.
    String permission = daoKey_ + "." + permissionTemplate.getOperation();
    for (String prop : permissionTemplate.getProperties()) {
      permission += "." + obj.getProperty(prop);
    }
    return permission;
  }

  public String checkPermissionTemplates(X x, String op, Object obj) {
    AuthService authService = (AuthService) x.get("auth");
    DAO permissionTemplateDAO = (DAO) x.get("permissionTemplateReferenceDAO");

    Predicate predicate = (Predicate) AND(
      IN(daoKey_, PermissionTemplateReference.DAO_KEYS),
      EQ(PermissionTemplateReference.OPERATION, op)
    );

    ArraySink permissionTemplates = (ArraySink) permissionTemplateDAO.where(predicate).select(new AbstractSink(){
      public void put(Object o, Detachable d) {
        Permission permission = (Permission) createPermission(o, obj);
        if ( ! authService.check(x, permission) ) {
          ((foam.nanos.logger.Logger) x.get("logger")).debug("ExtendedConfigurableAuthorizer", "Permission denied", permission);
          throw new AuthorizationException();
        }
      }
    });
  },

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
    String permission = daoKey + ".read.*";
    AuthService authService = (AuthService) x.get("auth");
    try {
      return authService.check(x, permission);
    } catch ( AuthorizationException e ) {
      return false;
    }
  }

  public boolean checkGlobalRemove(X x) {
    String permission = daoKey + ".remove.*";
    AuthService authService = (AuthService) x.get("auth");
    try {
      return authService.check(x, permission);
    } catch ( AuthorizationException e ) {
      return false;
    }

  }
}
