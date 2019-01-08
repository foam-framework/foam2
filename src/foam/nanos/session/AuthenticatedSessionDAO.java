package foam.nanos.session;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.session.Session;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;


import static foam.mlang.MLang.EQ;

public class AuthenticatedSessionDAO
    extends ProxyDAO
{
  public final static String GLOBAL_SESSION_READ = "session.read.*";
  public final static String GLOBAL_SESSION_DELETE = "session.delete.*";
  // public final static String GLOBAL_SESSION_CREATE = "session.create";

  public AuthenticatedSessionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

// QUESTION -> This is causing an error, do we need this? You can't create a session for 
// another user without a username, password, can you?

//   @Override
//   public FObject put_(X x, FObject obj) {
//     User user = (User) x.get("user");
//     Session newSession = (Session) obj;
//
//     if ( user == null ) {
//       throw new AuthenticationException();
//     }
//
//     if ( user.getId() != newSession.getUserId() ) {
//       throw new AuthorizationException("You cannot create a session for another user.");
//     }
//
//     return super.put_(x, obj);
//   }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    Session session = (Session) super.find_(x, id);

    if ( session == null ) return null;

    if ( session.getUserId() == user.getId() || auth.check(x, GLOBAL_SESSION_READ) ) {
      return session;
    }
    
    return null;
    }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    boolean global = auth.check(x, GLOBAL_SESSION_READ);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(Session.USER_ID, user.getId()));
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User user = (User) x.get("user");
    Session newSession = (Session) obj;

    if ( user == null ) {
      throw new AuthenticationException();
    }

    if ( user.getId() != newSession.getUserId() ) {
      System.out.println("EXception triggered");
      throw new AuthorizationException("You cannot delete a session for another user.");
    }

    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    boolean global = auth.check(x, GLOBAL_SESSION_DELETE);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(Session.USER_ID, user.getId()));
    dao.removeAll_(x, skip, limit, order, predicate);
  }
  
}
