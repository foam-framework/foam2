package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;

import java.security.NoSuchAlgorithmException;

//TODO: Throw exception for print statements when they are ready
public class AuthenticatedUserDAO
  extends ProxyDAO
{
  public AuthenticatedUserDAO(DAO delegate) {
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject fObject) {
    if ( fObject instanceof User ) {
      User user = (User) fObject;

      if ( find(user.getId()) != null ) {
        System.out.println("A user has already been registered with this account");
        return null;
      }

      AuthService service = (AuthService) x.get("auth");
      if ( service == null ) {
        System.out.println("Auth Service not started");
        return null;
      }

      try {
        service.validateUser(user);
        Count count = (Count) this.limit(1).where(MLang.EQ(User.EMAIL, user.getEmail())).select(new Count());

        if ( count.getValue() > 0 ) {
          System.out.println("An account is already registered with this email address");
          return null;
        }

        String salt = UserAndGroupAuthService.generateRandomSalt();
        user.setPassword(UserAndGroupAuthService.hashPassword(user.getPassword(), salt) + ":" + salt);
        return getDelegate().put_(x, user);
      }
      catch (RuntimeException e) {
        e.printStackTrace();
        return null;
      }
      catch (NoSuchAlgorithmException e) {
        e.printStackTrace();
        return null;
      }
    }
    return null;
  }

//  @Override
//  public FObject find_(X x, Object o) {
//    if ( o instanceof User ) {
//      User user               = (User) o;
//      User authenticatedUser  = (User) this.getX().get("user");
//
//      if ( authenticatedUser == null ) {
//        System.out.println("Please login");
//        return null;
//      }
//
//      if ( user.getId() != authenticatedUser.getId() ) {
//        System.out.println("You do not have access to this User");
//        return null;
//      }
//
//      return super.find_(x, o);
//    }
//
//    return null;
//  }
}