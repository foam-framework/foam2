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
import foam.util.SafetyUtil;
import java.util.Arrays;

/**
 * Custom authentication for groupDAO
 *
 * Features:
 *   - If creating a group, you can only give it permissions implied by those
 *     that you already have.
 *   - If updating a group, you can't modify the permissions array to have a
 *     permission that isn't implied by one you have.
 *   - If updating a group, you can't modify the parent of the group such that
 *     the group gains a permission that isn't implied by one you have.
 */
public class AuthenticatedGroupDAO extends ProxyDAO {
  public AuthenticatedGroupDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {

    // filter out all empty permissions
    ((Group) obj).setPermissions(
      Arrays.stream(((Group) obj).getPermissions()).filter(permission -> !"".equals(permission.getId())).toArray(Permission[]::new)
    );

    // If a new group is being created, check that the user has permission to create the group
    if ( getDelegate().find_(x, obj) == null ) {
      AuthService auth = (AuthService) x.get("auth");
      if ( ! auth.check(x, "group.create." + ((Group) obj).getId()) ) {
        throw new AuthorizationException("Permission Denied. You do not have requisite permission to create this group.");
      }
    }
    checkUserHasAllPermissionsInGroupAndAncestors(x, (Group) obj);
    return super.put_(x, obj);
  }

  public void checkUserHasAllPermissionsInGroupAndAncestors(X x, Group toCheck) {
    Group group = toCheck;
    checkUserHasAllPermissionsInGroup(x, group);
    while ( getAncestor(x, group) != null ) {
      group = getAncestor(x, group);
      checkUserHasAllPermissionsInGroup(x, group);
    }
  }

  // Make sure that the user has all permissions in the given group.
  public void checkUserHasAllPermissionsInGroup(X x, Group group) {
    AuthService auth = (AuthService) x.get("auth");
    Permission[] permissions = group.getPermissions();
    for ( Permission permission : permissions ) {
      String id = permission.getId();
      if ( ! auth.check(x, id) ) {
        throw new AuthorizationException("Permission Denied. You do not have the '" + id + "' permission.");
      }
    }
  }

  // returns ancestor of a group if it exists, otherwise null
  public Group getAncestor(X x, Group group) {
    String ancestorGroupId = group.getParent();
    if ( SafetyUtil.isEmpty(ancestorGroupId) ) {
      return null;
    }
    Group ancestor = (Group) getDelegate().find_(x, ancestorGroupId);
    if ( ancestor == null ) {
      throw new RuntimeException("The '" + group.getId() + "' group has a null ancestor named '" + ancestorGroupId + "'.");
    }
    return ancestor;
  }
}
