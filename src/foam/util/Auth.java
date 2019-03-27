/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.session.Session;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class Auth {

  public static X sudo(X x, Object id) {
    return sudo(x, (User) ((DAO) x.get("userDAO")).inX(x).find(id));
  }

  public static X sudo(X x, String email) {
    return sudo(x, (User) ((DAO) x.get("userDAO")).inX(x).find(AND(
      EQ(User.EMAIL, email),
      EQ(User.LOGIN_ENABLED, true)
    )));
  }

  public static X sudo(X x, User user) {
    if ( user == null ) throw new RuntimeException("Unknown user");

    Session session = new Session();
    x = x.put(Session.class, session);
    x = x.put("user", user);
    x = x.put("group", ((DAO) x.get("localGroupDAO")).inX(x).find(user.getGroup()));
    session.setUserId(user.getId());
    session.setContext(x);

    return x;
  }
}
