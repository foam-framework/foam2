/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth.username;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.User;

import static foam.mlang.MLang.*;

public class UsernameService
    extends    ContextAwareSupport
    implements UsernameServiceInterface, NanoService  {
  protected DAO userDAO;

  @Override
  public boolean checkAvailability(X x, String username) {
    ArraySink select =
      (ArraySink) userDAO.inX(x).where(EQ(User.USER_NAME, username)).select(new ArraySink());
    if ( select.getArray().size() != 0 ) {
      return false;
    }
    return true;
  }

  @Override
  public void start() {
    userDAO = (DAO) getX().get("localUserDAO");
  }
}