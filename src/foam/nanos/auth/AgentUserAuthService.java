/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
  public User actAs(X x, User entity) throws AuthenticationException {
    User agent = (User) x.get("user");
    User user = (User) userDAO_.find(entity.getId());

    // Check for current context user
    if ( agent == null ) {
      throw new AuthenticationException();
    }

    if ( user == null ) {
      throw new AuthorizationException("Entity user doesn't exist.");
    }

    Group group = (Group) groupDAO_.find(user.getGroup());

    if ( group == null ) {
      throw new AuthorizationException("Entity must exist within a group.");
    }

    if ( ! group.getEnabled() ) {
      throw new AuthorizationException("Entity' group must be enabled.");
    }

    /*
      Finds the UserUserJunction object to see if user can act as the passed in user.
      Source (agent) users are permitted to act as target (entity) users, not vice versa.
    */
    UserUserJunction permissionJunction = (UserUserJunction) agentJunctionDAO_.find(AND(
      EQ(UserUserJunction.SOURCE_ID, agent.getId()),
      EQ(UserUserJunction.TARGET_ID, user.getId())
    ));

    if ( permissionJunction == null ) {
      throw new AuthorizationException("You don't have access to act as the requested entity.");
    }

    // Junction object contains a group which has a unique set of permissions specific to the relationship.
    Group actingWithinGroup = (Group) groupDAO_.find(permissionJunction.getGroup());

    if ( actingWithinGroup == null || ! actingWithinGroup.getEnabled() ) {
      throw new AuthorizationException("No permissions are appended to the entity relationship.");
    }

    // Clone user and associate new junction group to user. Clone and freeze both user and agent.
    user = (User) user.fclone();
    user.setGroup(actingWithinGroup.getId());
    user.freeze();

    agent = (User) agent.fclone();
    agent.freeze();

    // Set user and agent objects into the session context and place into sessionDAO.
    Session session = x.get(Session.class);
    session.setUserId(user.getId());
    session.setContext(session.getContext().put("user", user));
    session.setContext(session.getContext().put("agent", agent));
    return user;
  }

  /**
    Retrieves the agent user from the current sessions context.
  */
  public User getCurrentAgent(X x) throws AuthorizationException {
    // Fetch context and check if not null.
    Session session = x.get(Session.class);
    if ( session == null ) {
      throw new AuthenticationException("Not logged in");
    }

    X sessionContext = session.getContext();
    // Get agent from session context
    User agent = (User) sessionContext.get("agent");
    if ( agent != null ) {
      agent = (User) userDAO_.find(agent.getId());
    }
    return agent;
  }
}
