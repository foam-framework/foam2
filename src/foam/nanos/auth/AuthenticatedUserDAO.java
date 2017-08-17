package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class AuthenticatedUserDAO
  extends ProxyDAO
{

  @Override
  public FObject put_(X x, FObject fObject) {
    if ( fObject instanceof User ) {
      User user = (User) fObject;

      if ( getDelegate().find(user.getId()) != null ) {
        System.out.println("A user has already been registered with this account");
        return null;
      }

      AuthService service_ = (AuthService) getX().get("auth");
      if ( service_ == null ) {
        System.out.println("Auth Service not started");
        return null;
      }

      try {
        service_.validateUser(user);
        getDelegate().put_(x, fObject);
        return user;
      }
      catch (RuntimeException e) {
        e.printStackTrace();
        return null;
      }
    }
    return null;
  }

  @Override
  public FObject remove_(X x, FObject fObject) {
    return null;
  }

  @Override
  public FObject find_(X x, Object o) {
    if ( o instanceof User ) {
      User user   = (User) o;
      User xUser  = (User) this.getX().get("user");

      if ( xUser == null ) {
        System.out.println("User not logged in");
      }

      if ( user.getId() != xUser.getId() ) {
        System.out.println("You do not have access to this User");
        return null;
      }

      return getDelegate().find(o);
    }

    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, long l, long l1, Comparator comparator, Predicate predicate) {
    return null;
  }
}
