/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth.email;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;

public class EmailVerificationDAO
  extends ProxyDAO
{
  EmailTokenService emailToken;

  public EmailVerificationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    emailToken = (EmailTokenService) x.get("emailToken");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    boolean newUser = getDelegate().find(((User) obj).getId()) == null;

    // send email verification if new user
    User result = (User) super.put_(x, obj);
    if ( result != null && newUser && ! result.getEmailVerified() ) {
      emailToken.generateToken(x, result);
    }

    return result;
  }
}
