/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.GroupPermissionJunction;
import foam.nanos.auth.User;
import foam.nanos.session.Session;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/**
  Helper methods to aid in defining auth logic that allow the system to recognizes and create various auth states.
  These utility methods are usually to be applied after some layer of authorization has occured or for testing purposes.
 */
public class Auth {
  /**
    Applies provided user into session and context (Does not save the session.)
    @param user user to be applied(logged in) to context and session.
  */
  public static X sudo(X x, User user) {
    if ( user == null ) throw new RuntimeException("Unknown user");

    Session session = new Session();
    session.setUserId(user.getId());
    X y = session.applyTo(x);
    session.setContext(y);
    y = y.put(Session.class, session);
    return y;
  }

  /**
    Applies the provided id related user into session and context
    @param id used to find the user which will be applied(logged in) to context and session.
  */
  
  public static X sudo(X x, Object id) {
    return sudo(x, (User) ((DAO) x.get("userDAO")).inX(x).find(id));
  }

  /**
    Applies the provided email related user into session and context
    @param email used to find the user which will be applied(logged in) to context and session.
  */
  public static X sudo(X x, String email) {
    return sudo(x, (User) ((DAO) x.get("userDAO")).inX(x).find(AND(
      EQ(User.EMAIL, email),
      EQ(User.LOGIN_ENABLED, true)
    )));
  }

  /**
  Applies provided user into session, context and applies the group provided.
  @param user User that will be the "user" within context' subject (You can think of it as the main user of the session)
  @param group Group that the context will be applying its permission list from
  */
  public static X sudo(X x, User user, Group group) {
    x = sudo(x, user);
    x = x.put("group", group);
    return x;
  }

  /**
    Applies user acting as another user within the context provided. user and realuser of context' subject would be typically different.
    @param user User that will be the "user" within context' subject (You can think of it as the main user of the session)
    @param realUser User that will be acting as the @param user. References realUser within context' subject.
   */
  public static X sudo(X x, User user, User realUser) {
    Session session = new Session.Builder(x)
      .setUserId(user.getId())
      .setAgentId(realUser.getId())
      .build();
    session.setContext(session.applyTo(session.getContext()));
    x = x.put(Session.class, session);
    return x;
  }

  /**
    Applies user acting as another user within the context provided. Applies provided
    group to the session. Flexible use of permissioning (AgentJunction between user and realUser isn't required.)
    @param user User that will be the "user" within context' subject (You can think of it as the main user of the session)
    @param realUser User that will be acting as the @param user. References realUser within context' subject.
    @param group Group the context will be applying its permission list from.
   */
  public static X sudo(X x, User user, User realUser, Group group) {
    x = sudo(x, user, realUser);
    x = x.put("group", group);
    return x;
  }

  /**
   * Simple create group helper method
   * @param groupId identifier of the group being created.
   * returns group.
   */
  public static Group createGroup(X x, String groupId) {
    DAO groupDAO = (DAO) x.get("groupDAO");
    return (Group) groupDAO.put(new Group.Builder(x).setId(groupId).build());
  }

  /**
   * Simple create group helper method
   * @param groupId identifier of the group being created.
   * @param parentId identifier of the groups parent.
   * returns group.
   */
  public static Group createGroup(X x, String groupId, String parentId) {
    DAO groupDAO = (DAO) x.get("groupDAO");
    return (Group) groupDAO.put(new Group.Builder(x).setId(groupId).setId(parentId).build());
  }

  /**
   * Applies permission to the provided group' permission list.
   * @param String groupId to apply the permission to (String ID)
   * @param String permission to be granted to group found with @param groupId
   */
  public static void applyPermissionToGroup(X x, String groupId, String permission) {
    DAO groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");
    groupPermissionJunctionDAO.put(
      new GroupPermissionJunction.Builder(x)
        .setSourceId(groupId)
        .setTargetId(permission)
        .build()
    );
  }

  /**
   * Applies permission to the provided group' permission list.
   * @param String groupId associate to group to apply @param permissions to.
   * @param String[] permissions to be granted to group with @param groupId.
  */
  public static void applyPermissionToGroup(X x, String groupId, String[] permissions) {
    for ( String permission : permissions ) {
      applyPermissionToGroup(x, groupId, permission);
    }
  }
}
