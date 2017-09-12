/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.mlang.sink.Count;

import javax.naming.AuthenticationException;
import java.security.NoSuchAlgorithmException;

public class AuthenticatedUserDAO
  extends ProxyDAO
{
  public AuthenticatedUserDAO(DAO delegate) {
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject fObject) throws RuntimeException {
    User user = (User) fObject;

    if ( getDelegate().find_(x, user.getId()) != null ) {
      throw new RuntimeException("A user has already been registered with this account");
    }

    AuthService service = (AuthService) x.get("auth");
    if ( service == null ) {
      throw new RuntimeException("Auth Service not started");
    }

    try {
      service.validateUser(user);
      Count count = (Count) this.limit(1).where(MLang.EQ(User.EMAIL, user.getEmail())).select(new Count());

      if ( count.getValue() > 0 ) {
        throw new RuntimeException("An account is already registered with this email address");
      }

      String salt = UserAndGroupAuthService.generateRandomSalt();
      user.setPassword(UserAndGroupAuthService.hashPassword(user.getPassword(), salt) + ":" + salt);

      return getDelegate().put_(x, user);
    }
    catch (AuthenticationException e) {
      throw new RuntimeException(e);
    }
    catch (NoSuchAlgorithmException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  /**
   * Restrict find method to only return the logged in user object
   * */
  public FObject find_(X x, Object id) throws RuntimeException {
    User user = (User) x.get("user");

    if ( user == null || user.getId() != (long) id ) {
      throw new RuntimeException("User is not logged in");
    }

    return super.find_(x, user.getId());
  }

  @Override
  public Sink select(Sink sink) throws RuntimeException {
    throw new RuntimeException("Select not allowed on Authenticated User DAO");
  }

  @Override
  public FObject remove(FObject obj) throws RuntimeException {
    throw new RuntimeException("Remove not allowed on Authenticated User DAO");
  }

  @Override
  public void removeAll() throws RuntimeException {
    throw new RuntimeException("RemoveAll not allowed on Authenticated User DAO");
  }
}
