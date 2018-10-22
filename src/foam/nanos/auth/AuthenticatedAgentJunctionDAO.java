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
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.util.SafetyUtil;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;
import static foam.mlang.MLang.AND;

/**
 * Authenticated AgentJunctionDAO
 * Restrict users from creating a junction object where they are the source user (Agent)
 * Restrict users from finding and selecting junction objects they are not referenced to. (Agent or Super user)
 * Restrict users from removing junction objects where they are the source user (Agent)
 */
public class AuthenticatedAgentJunctionDAO
  extends ProxyDAO
{

  public final static String GLOBAL_AGENT_JUNCTION_READ   = "agentJunction.read.*";
  public final static String GLOBAL_AGENT_JUNCTION_UPDATE = "agentJunction.update.*";
  public final static String GLOBAL_AGENT_JUNCTION_DELETE = "agentJunction.delete.*";

  public AuthenticatedAgentJunctionDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    User agent = (User) x.get("agent");
    AuthService auth    = (AuthService) x.get("auth");

    // Currently cannot set objects on the agentJunction if acting as another user.
    if ( agent != null ) {
      throw new RuntimeException("Unable to make changes to the agent junction while acting as another user.");
    }

    UserUserJunction junctionObj = (UserUserJunction) obj;

    // Prevents put if user has no permission or if user isn't the targetId of the junction object being created.
    if ( junctionObj != null && ! SafetyUtil.equals(junctionObj.getSourceId(), user.getId()) &&
      ! auth.check(x, GLOBAL_AGENT_JUNCTION_UPDATE) ) {
      throw new RuntimeException("Unable to update junction.");
    }

    return super.put_(x, junctionObj);
  }

  @Override
  public FObject find_(X x, Object id) {
    UserUserJunction junctionObj = (UserUserJunction) super.inX(x).find(id);
    
    // Check global permissions
    if ( userAndAgentAuthorized(x, junctionObj, GLOBAL_AGENT_JUNCTION_READ) ) {
      return junctionObj;
    }

    return null;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    if ( obj == null ){ 
      throw new RuntimeException("Junction object is null.");
    }

    UserUserJunction junctionObj = (UserUserJunction) super.inX(x).find(obj);

    if ( userAndAgentAuthorized(x, junctionObj, GLOBAL_AGENT_JUNCTION_DELETE) ) {
      return super.inX(x).remove(obj);
    }

    throw new AuthorizationException("Unable to remove object.");
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    User agent = (User) x.get("agent");
    AuthService auth = (AuthService) x.get("auth");

    if ( agent == null) {
      return;
    }

    boolean global = auth.check(x, GLOBAL_AGENT_JUNCTION_DELETE);

    DAO dao = global ? getDelegate() : getDelegate().where(EQ(UserUserJunction.TARGET_ID, user.getId()));
    dao.removeAll_(x, skip, limit, order, predicate);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    boolean global = auth.check(x, GLOBAL_AGENT_JUNCTION_READ);
    
    DAO dao = global ? getDelegate() :
        getDelegate().where(
          OR(
            EQ(UserUserJunction.TARGET_ID, user.getId()),
            EQ(UserUserJunction.SOURCE_ID, user.getId())
          )
        );

    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  public boolean userAndAgentAuthorized(X x, UserUserJunction junctionObj, String permission){
    User user = (User) x.get("user");
    User agent = (User) x.get("agent");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    // Check agent in context, junction object related to agent condition.
    boolean agentAuthorized = agent != null && 
        ( SafetyUtil.equals(junctionObj.getTargetId(), agent.getId()) ||
        SafetyUtil.equals(junctionObj.getSourceId(), agent.getId()) );

    // Check if agent doesn't exist, Junction object related to user condition.
    boolean userAuthorized = agent == null &&
        ( SafetyUtil.equals(junctionObj.getTargetId(), user.getId()) ||
        SafetyUtil.equals(junctionObj.getSourceId(), user.getId()) );

    return auth.check(x, permission) || agentAuthorized || userAuthorized;
  }

  // Returns predicated delegate based on user and agent in context.
  public DAO getFilteredDAO(X x, String permission) {
    User user = (User) x.get("user");
    User agent = (User) x.get("agent");
    AuthService auth = (AuthService) x.get("auth");

    if ( auth.check(x, permission) )
        return super.inX(x);

    User delegateUser = agent != null ? agent : user;

    return super.inX(x).where(AND(
      EQ(UserUserJunction.TARGET_ID, delegateUser.getId()),
      EQ(UserUserJunction.SOURCE_ID, delegateUser.getId())
    ));
  }
}
