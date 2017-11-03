/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.register;

import foam.core.ContextAware;
import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.User;

public class UserRegistrationService
    extends ContextAwareSupport
    implements RegistrationService, NanoService
{
  protected DAO userDAO_;

  @Override
  public User register(User user) {
    return null;
  }

  @Override
  public void start() {
    userDAO_ = (DAO) getX().get("localUserDAO");
  }
}