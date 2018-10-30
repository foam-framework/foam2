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

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;

/**
 * Authenticated AgentJunctionDAO
 * Restrict users from creating a junction object where they are the source user (Agent)
 * Restrict users from finding and selecting junction objects they are not referenced to. (Agent or Entity)
 * Restrict users from removing junction objects where they aren't the target user or source user. (Agent or Entity)
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

  /**
   * Allows put if user or agent is target of the junction object.
   * If agent exists within context, condition checks on agent user.
   */
  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    User agent = (User) x.get("agent");
    DAO groupDAO = (DAO) x.get("groupDAO");
    AuthService auth = (AuthService) x.get("auth");

    UserUserJunction junctionObj = (UserUserJunction) obj;

    if ( junctionObj == null ) {
      return null;
    }

    // Checks group' junction object exists.
    Group groupToBePut = (Group) groupDAO.find(junctionObj.getGroup());

    if ( groupToBePut == null ) {
      throw new IllegalStateException("Junction object group doesn't exist.");
    }

    // Permit permission check if agent is not present within context.
    if ( auth.check(x, GLOBAL_AGENT_JUNCTION_UPDATE) ) {
      return getDelegate().put_(x, junctionObj);
    }

    // Check agent or user to authorize the request as.
    User authorizedUser = agent != null ? agent : user;

    // Check junction object relation to authorized user.
    boolean authorized = SafetyUtil.equals(junctionObj.getTargetId(), authorizedUser.getId());

    if ( ! authorized ) {
      throw new AuthorizationException("Unable to update junction.");
    }

    if ( ! auth.check(x, "group.update." + junctionObj.getGroup()) ) {
      throw new AuthorizationException("Cannot assign non permitted group on junction.");
    }

    return getDelegate().put_(x, junctionObj);
  }

  /**
   * Return junction object based on logic within userAgentAuthorization method.
   */
  @Override
  public FObject find_(X x, Object id) {
    UserUserJunction junctionObj = (UserUserJunction) getDelegate().find_(x, id);
    
    if ( junctionObj == null )
        return null;

    // Check global permissions
    if ( userAgentAuthorization(x, junctionObj, GLOBAL_AGENT_JUNCTION_READ) ) {
      return junctionObj;
    }

    return null;
  }

  /**
   * Allow users to remove junction objects based on logic within userAgentAuthorization method.
   */
  @Override
  public FObject remove_(X x, FObject obj) {
    UserUserJunction junctionObj = (UserUserJunction) getDelegate().inX(x).find(obj);

    if ( junctionObj == null )
        return null;

    if ( userAgentAuthorization(x, junctionObj, GLOBAL_AGENT_JUNCTION_DELETE) ) {
      return getDelegate().remove_(x, junctionObj);
    }

    throw new AuthorizationException("Unable to remove object.");
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    DAO dao = getFilteredDAO(x, GLOBAL_AGENT_JUNCTION_DELETE);

    dao.removeAll_(x, skip, limit, order, predicate);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    DAO dao = getFilteredDAO(x, GLOBAL_AGENT_JUNCTION_READ);

    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  /**
   * Checks if agent is present within the context, if so check id on target and source
   * of junction object. If no agent is present within the context, apply target and source condition to user.
   */
  public boolean userAgentAuthorization(X x, UserUserJunction junctionObj, String permission){
    User user = (User) x.get("user");
    User agent = (User) x.get("agent");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    // Check agent or user to authorize the request as.
    User authorizedUser = agent != null ? agent : user;

    // Check junction object relation to authorized user.
    boolean authorized =
        ( SafetyUtil.equals(junctionObj.getTargetId(), authorizedUser.getId()) ||
        SafetyUtil.equals(junctionObj.getSourceId(), authorizedUser.getId()) );

    return  authorized || auth.check(x, permission);
  }

  // Returns predicated delegate based on user and agent in context.
  public DAO getFilteredDAO(X x, String permission) {
    User user = (User) x.get("user");
    User agent = (User) x.get("agent");
    AuthService auth = (AuthService) x.get("auth");

    if ( auth.check(x, permission) )
        return getDelegate();

    // Check agent or user to authorize the request as.
    User authorizedUser = agent != null ? agent : user;

    return getDelegate().where(OR(
      EQ(UserUserJunction.TARGET_ID, authorizedUser.getId()),
      EQ(UserUserJunction.SOURCE_ID, authorizedUser.getId())
    ));
  }
}
