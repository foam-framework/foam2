/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.util.Password;
import foam.util.SafetyUtil;
import java.util.Calendar;

public class UserPasswordHashingDAO
  extends ProxyDAO
{
  public UserPasswordHashingDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user   = (User) obj;
    User stored = (User) getDelegate().find(user.getId());

    // hash desired password if provided
    if ( ! SafetyUtil.isEmpty(user.getDesiredPassword()) ) {
      user.setPassword(Password.hash(user.getDesiredPassword()));
      user.setPasswordLastModified(Calendar.getInstance().getTime());
      // set previous password if present
      if ( stored != null && ! SafetyUtil.isEmpty(stored.getPassword()) ) {
        user.setPreviousPassword(stored.getPassword());
      }
      return super.put_(x, obj);
    }

    // if user not found, continue
    if ( stored == null ) {
      return super.put_(x, obj);
    }

    // set password if not empty
    if ( ! SafetyUtil.isEmpty(stored.getPassword()) ) {
      user.setPassword(stored.getPassword());
    }

    // set previous password if not empty
    if ( ! SafetyUtil.isEmpty(stored.getPreviousPassword()) ) {
      user.setPreviousPassword(stored.getPreviousPassword());
    }

    // set password last modified if not null
    if ( stored.getPasswordLastModified() != null ) {
      user.setPasswordLastModified(stored.getPasswordLastModified());
    }
    
    return super.put_(x, obj);
  }
}
