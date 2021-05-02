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
import foam.nanos.logger.Logger;
import foam.nanos.session.Session;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

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
    groupDAO_         = (DAO) getX().get("localGroupDAO");
    sessionDAO_       = (DAO) getX().get("localSessionDAO");
    agentJunctionDAO_ = (DAO) getX().get("agentJunctionDAO");
  }

  /*
    Sets the currently logged in user as an "agent" within the context &
    sets "user" in the context to the passed in user. This allows users to
    act on behalf of others while retaining information on the user.
  */
  public Subject actAs(X x, User entity) throws AuthenticationException {
    User agent = ((Subject) x.get("subject")).getRealUser();
    User user  = (User) userDAO_.find(entity.getId());

    // Check for current context user
    if ( agent == null ) {
      throw new AuthenticationException();
    }

    if ( user == null || user.getLifecycleState() != LifecycleState.ACTIVE ) {
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

    // Purge auth cache
    CachingAuthService.purgeCache(x);

    // Set user and agent objects into the session context and place into sessionDAO.
    Session session = x.get(Session.class);
    session.setUserId(user.getId());
    session.setAgentId(agent.getId());
    foam.nanos.crunch.ServerCrunchService.purgeCache(x);
    session = (Session) sessionDAO_.put(session);
    session.setContext(session.applyTo(session.getContext()));

    // Return subject (user and agent) in the session
    return (Subject) session.getContext().get("subject");
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

      if ( permissionJunction.getStatus() != AgentJunctionStatus.ACTIVE ) {
        throw new AuthorizationException("Junction currently disabled, unable to act as user.");
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

  public void logout(X x) {
    User agent = ((Subject) x.get("subject")).getRealUser();

    // Check for current context user
    if ( agent == null || agent.getLifecycleState() != LifecycleState.ACTIVE ) {
      return;
    }

    agent = (User) agent.fclone();
    agent.freeze();

    // Purge auth cache
    CachingAuthService.purgeCache(x);

    // Update the session and context
    Session session = x.get(Session.class);
    session.setUserId(agent.getId());
    session.setAgentId(0);
    foam.nanos.crunch.ServerCrunchService.purgeCache(x);
    session = (Session) sessionDAO_.put(session);
    session.setContext(session.applyTo(session.getContext()));
  }
}
