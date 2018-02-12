package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import java.security.AccessControlException;
import net.nanopay.model.Account;
import static foam.mlang.MLang.EQ;

/**
 * Authenticate UserDAO
 *
 * Features:
 *  - restrict creation/updating of users
 *  - restrict group of users created/updated
 *  - restrict deletion of users
 *  - restrict selection of users
 *    - can only see self by default
 *    - can see users belonging to groups you can create
 *  - grant access to based on SPID
 *  - set SPID to same as user creating new user if they don't have the global
 *    spid property
 **/
public class AuthenticatedUserDAO
  extends ProxyDAO
{
  public final static String GLOBAL_USER_CREATE = "user.create.x";
  public final static String GLOBAL_USER_READ   = "user.read.x";
  public final static String GLOBAL_USER_UPDATE = "user.update.x";
  public final static String GLOBAL_USER_DELETE = "user.delete.x";

  public final static String GLOBAL_SPID_CREATE = "spid.create.x";

  public AuthenticatedUserDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User        user    = (User) x.get("user");
    AuthService auth    = (AuthService) x.get("auth");

    // if current user doesn't have permissions to create or update, force account's owner to be current user id
    if ( ! auth.check(x, GLOBAL_USER_CREATE) || ! auth.check(x, GLOBAL_USER_UPDATE) ) {
      // account.setId(user.getId());
    }
    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    User        user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    Account account = (Account) getDelegate().find_(x, id);
    if ( account != null && account.getId() != user.getId() && ! auth.check(x, GLOBAL_USER_READ) ) {
      return null;
    }
    return account;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User        user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    boolean global = auth.check(x, GLOBAL_USER_READ);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(Account.ID, user.getId()));
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User        user    = (User) x.get("user");
    Account     account = (Account) obj;
    AuthService auth    = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    if ( account != null && account.getId() != user.getId() && ! auth.check(x, GLOBAL_USER_DELETE) ) {
      throw new RuntimeException("Unable to delete bank account");
    }

    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    User        user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    boolean global = auth.check(x, GLOBAL_USER_DELETE);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(Account.ID, user.getId()));
    dao.removeAll_(x, skip, limit, order, predicate);
  }
}
