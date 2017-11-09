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
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.util.Email;

/**
 * DAO decorator that prevents putting a user with the same email
 */
public class PreventDuplicateEmailDAO
    extends ProxyDAO
{
  public PreventDuplicateEmailDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) obj;
    boolean newUser = ( getDelegate().find(user.getId()) == null );

    if ( newUser ) {
      if ( user.getEmail() == null || user.getEmail().isEmpty() ) {
        throw new RuntimeException("Email required");
      }

      if ( ! Email.isValid(user.getEmail()) ) {
        throw new RuntimeException("Invalid Email");
      }

      Count count = new Count();
      count = (Count) ((DAO) getX().get("localUserDAO"))
          .where(MLang.EQ(User.EMAIL, user.getEmail()))
          .limit(1).select(count);
      if ( count.getValue() == 1 ) {
        throw new RuntimeException("User already exists");
      }
    }

    return super.put_(x, obj);
  }
}