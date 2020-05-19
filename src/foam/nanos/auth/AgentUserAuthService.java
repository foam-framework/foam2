/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import foam.nanos.session.Session;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
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
    userDAO_          = (DAO) getX().get("localUserDAO");
    groupDAO_         = (DAO) getX().get("groupDAO");
    sessionDAO_       = (DAO) getX().get("localSessionDAO");
    agentJunctionDAO_ = (DAO) getX().get("agentJunctionDAO");
  }

  /*
    Sets the currently logged in user as an "agent" within the context &
    sets "user" in the context to the passed in user. This allows users to
    act on behalf of others while retaining information on the user.
  */
  public User actAs(X x, User entity) throws AuthenticationException {
    User agent = ((Subject) x.get("subject")).getUser();
    User user  = (User) userDAO_.find(entity.getId());

    // Check for current context user
    if ( agent == null ) {
      throw new AuthenticationException();
    }

    if ( user == null ) {
      throw new AuthorizationException("Entity user doesn't exist.");
    }

    if ( ! canActAs(x, agent, user) ) {
      return null;
    }

    // Clone and freeze both user and agent.
    user = (User) user.fclone();
    user.freeze();

    agent = (User) agent.fclone();
    agent.freeze();

    // Set user and agent objects into the session context and place into sessionDAO.
    Session session = x.get(Session.class);
    session.setUserId(user.getId());
    session.setAgentId(agent.getId());
    session = (Session) sessionDAO_.put(session);
    session.setContext(session.applyTo(session.getContext()));
    return user;
  }

  public boolean canActAs(X x, User agent, User entity) {
    try {
      Group group = (Group) groupDAO_.find(entity.getGroup());

      if ( group == null ) {
        throw new AuthorizationException("Entity must exist within a group.");
      }

      if ( ! group.getEnabled() ) {
        throw new AuthorizationException("Entity's group must be enabled.");
      }

      /*
      Finds the UserUserJunction object to see if user can act as the passed in user.
      Source (agent) users are permitted to act as target (entity) users, not vice versa.
      */
      UserUserJunction permissionJunction = (UserUserJunction) agentJunctionDAO_.find(AND(
        EQ(UserUserJunction.SOURCE_ID, agent.getId()),
        EQ(UserUserJunction.TARGET_ID, entity.getId())
      ));

      if ( permissionJunction == null ) {
        throw new AuthorizationException("You don't have access to act as the requested entity.");
      }

      // Junction object contains a group which has a unique set of permissions specific to the relationship.
      Group actingWithinGroup = (Group) groupDAO_.find(permissionJunction.getGroup());

      if ( actingWithinGroup == null || ! actingWithinGroup.getEnabled() ) {
        throw new AuthorizationException("No permissions are appended to the entity relationship.");
      }
      return true;
    } catch (Throwable t) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Unable to act as entity: ", t);
      return false;
    }
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
    User agent = ((Subject) sessionContext.get("subject")).getRealUser();
    if ( agent != null ) {
      agent = (User) userDAO_.find(agent.getId());
      agent.validateAuth(x);
    }
    return agent;
  }
}
