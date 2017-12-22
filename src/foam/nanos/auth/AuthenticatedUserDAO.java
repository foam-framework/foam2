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
    User user = (User) fObject;

    if ( super.find_(x, user.getId()) != null ) {
      System.out.println("A user has already been registered with this account");
      return null;
    }

    AuthService service = (AuthService) x.get("auth");
    if ( service == null ) {
      System.out.println("Auth Service not started");
      return null;
    }

    try {
//      service.validateUser(user);
      Count count = (Count) this.limit(1).where(MLang.EQ(User.EMAIL, user.getEmail())).select(new Count());

      if ( count.getValue() > 0 ) {
        System.out.println("An account is already registered with this email address");
        return null;
      }

//      String salt = UserAndGroupAuthService.generateRandomSalt();
//      user.setPassword(UserAndGroupAuthService.hashPassword(user.getPassword(), salt) + ":" + salt);
      return getDelegate().put_(x, user);
    }
    catch (RuntimeException e) {
      e.printStackTrace();
      return null;
    }
  }
}