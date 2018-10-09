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
  public User actAs(X x, User superUser) throws AuthenticationException {
    User agent = (User) x.get("user");
    User user = (User) userDAO_.find(superUser.getId());

    if ( agent == null ) {
      throw new AuthenticationException();
    }

    if ( user == null ) {
      throw new AuthenticationException("Super user doesn't exist.");
    }

    Group group = (Group) groupDAO_.find(user.getGroup());

    if ( group == null && ! group.getEnabled() ) {
      throw new AuthenticationException("Super user must exist within a group.");
    }

    /*
      Finds the AgentUserJunction object to see if user can log in as the passed in user.
      Source users are permitted to act as target users, not vice versa.
    */
    UserUserJunction permissionJunction = (UserUserJunction) agentJunctionDAO_.find(AND(
      EQ(UserUserJunction.SOURCE_ID, agent.getId()),
      EQ(UserUserJunction.TARGET_ID, user.getId())
    ));

    if ( permissionJunction == null ) {
      throw new AuthorizationException("You don't have access to act as the requested super user.");
    }

    // Junction object contains a group which has a unique set of permissions specific to the relationship.
    Group actingWithinGroup = (Group) groupDAO_.find(permissionJunction.getGroup());

    if ( actingWithinGroup == null && ! actingWithinGroup.getEnabled() ) {
      throw new AuthenticationException("No permissions are appended to the super user relationship.");
    }
    
    // Clone user and associate new junction group to user. Clone and freeze both user and agent. 
    user = (User) user.fclone();
    user.setGroup(actingWithinGroup.getId());
    user.freeze();

    agent = (User) user.fclone();
    agent.freeze();

    // Set user and agent objects into the session context and place into sessionDAO.
    Session session = x.get(Session.class);
    session.setUserId(user.getId());
    session.setContext(session.getContext().put("user", user));
    session.setContext(session.getContext().put("agent", agent));
    sessionDAO_.put(session);
    
    return user;
  }

  /**
    Retrieves the agent user from the current sessions context.
  */
  public User getCurrentAgent(X x) throws AuthenticationException {
    // fetch context and check if not null or user id is 0
    Session session = x.get(Session.class);
    if ( session == null ) {
      throw new AuthenticationException("Not logged in");
    }

    X sessionContext = session.getContext();
    // get agent from session context
    User agent = (User) sessionContext.get("agent");

    if ( agent == null ) {
      throw new AuthenticationException("Agent not found.");
    }

    // check if user enabled
    if ( ! agent.getEnabled() ) {
      throw new AuthenticationException("Agent disabled");
    }

    return agent;
  }
}