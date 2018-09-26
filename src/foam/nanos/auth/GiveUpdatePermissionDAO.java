/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;

/**
 * When a user creates a new group, give the group they're in permission to
 * update the new group, which will also allow them to put other users in this
 * group.
 */
public class GiveUpdatePermissionDAO extends ProxyDAO {
  public GiveUpdatePermissionDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Group toPut = (Group) obj;
    Group existing = (Group) getDelegate().find_(x, toPut.getId());
    AuthService auth = (AuthService) x.get("auth");

    if ( existing == null && ! auth.check(x, "group.update." + toPut.getId()) ) {
      // Get the group of the current user and add a permission to update the
      // new group to it.
      User user = (User) x.get("user");
      Group userGroup = (Group) getDelegate().find_(x, user.getGroup());

      Permission[] currentPermissions = userGroup.getPermissions();
      Permission[] newPermissions = new Permission[currentPermissions.length + 1];

      System.arraycopy(currentPermissions, 0, newPermissions, 0, currentPermissions.length);

      Permission updatePermission = new Permission();
      updatePermission.setId("group.update." + toPut.getId());
      newPermissions[currentPermissions.length] = updatePermission;
      userGroup.setPermissions(newPermissions);

      getDelegate().put_(x, userGroup);
    }

    return super.put_(x, obj);
  }
}
