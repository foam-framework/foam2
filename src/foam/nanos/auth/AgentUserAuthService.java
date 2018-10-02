/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.session.Session;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;

public class AgentUserAuthService
  extends    ContextAwareSupport
  implements AgentAuthService, NanoService
{
  protected DAO userDAO_;
  protected DAO groupDAO_;
  protected DAO sessionDAO_;
  protected DAO agentJunctionDAO_;

  public AgentUserAuthService(X x) {
    setX(x);
  }

  @Override
  public void start() {
    userDAO_     = (DAO) getX().get("localUserDAO");
    groupDAO_    = (DAO) getX().get("groupDAO");
    sessionDAO_  = (DAO) getX().get("sessionDAO");
    agentJunctionDAO_  = (DAO) getX().get("agentJunctionDAO");
  }

  /* 
    Sets the currently logged in user as an "agent" within the context &
    sets "user" in the context to the passed in user. This allows users to
    act on behalf of others while retaining information on the user.
  */
  public User ActAs(X x, User sudoUser) throws AuthenticationException {
    User agent = (User) x.get("user");
    User user = (User) userDAO_.find(sudoUser.getId());

    if ( agent == null ) {
      throw new AuthenticationException();
    }

    if ( user == null || ! user.getEnabled() ) {
      throw new AuthenticationException("Super user doesn't exist.");
    }

    Group group = (Group) groupDAO_.find(user.getGroup());

    if ( group == null ) {
      throw new AuthenticationException("User must exist within a group.");
    }

    // Finds the AgentUserJunction object to see if user can log in as the passed in user.
    // Source users are permissioned to act as target users, not visa versa.

    UserUserJunction permissionJunction = (UserUserJunction) agentJunctionDAO_.find(AND(
      EQ(UserUserJunction.SOURCE_ID, agent.getId()),
      EQ(UserUserJunction.TARGET_ID, user.getId())
    ));

    if ( permissionJunction == null ) {
      throw new AuthenticationException("You don't have access to act as the requested user.");
    }

    // Junction object contains a group which has a unique set of permissions specific to the relationship.
    Group ActingWithinGroup = (Group) groupDAO_.find(permissionJunction.getGroup());

    if ( group != null && ! group.getEnabled() ) {
      throw new AuthenticationException("User group disabled");
    }
    
    Session session = x.get(Session.class);
    session.setUserId(user.getId());
    session.setContext(session.getContext().put("user", user));
    session.setContext(session.getContext().put("agent", agent));
    session.setContext(session.getContext().put("group", ActingWithinGroup));
    sessionDAO_.put(session);
    
    return user;
  }
}
