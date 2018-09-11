package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.util.SafetyUtil;

/**
 * Custom authentication for groupDAO
 *
 * Features:
 *   - If creating a group, you can only give it permissions you already have.
 *   - If updating a group, you can't modify the permissions array to have a permission you don't have.
 *   - If removing a group, you have to have all of the permissions in that group.
 */
public class AuthenticatedGroupDAO extends ProxyDAO {
  public AuthenticatedGroupDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  /**
   * Make sure that the user has all permissions in the given group.
   */
  public void checkUserHasAllPermissionsInGroup(X x, Group toCheck) {
    AuthService auth = (AuthService) x.get("auth");
    String groupId = toCheck.getId();

    while ( ! SafetyUtil.isEmpty(groupId) ) {
      Group group = (Group) getDelegate().find_(x, groupId);

      if ( group == null ) {
        throw new RuntimeException("The '" + toCheck.getId() + "' group has a null ancestor named '" + groupId + "'.");
      }

      Permission[] permissions = group.getPermissions();

      for ( Permission permission : permissions ) {
        String id = permission.getId();
        if ( ! auth.check(x, id) ) {
          throw new AuthorizationException("Permission Denied. You do not have the '" + id + "' permission.");
        }
      }

      groupId = group.getParent();
    }
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Group toPut = (Group) obj;
    String id = toPut.getId();
    Group existing = (Group) getDelegate().find_(x, id);
    if ( existing != null ) checkUserHasAllPermissionsInGroup(x, existing);
    checkUserHasAllPermissionsInGroup(x, toPut);
    return super.put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    Group group = (Group) obj;
    checkUserHasAllPermissionsInGroup(x, group);
    return super.put_(x, obj);
  }
}
