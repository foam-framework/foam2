/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.util.Password;

public class PasswordHashingDAO
    extends ProxyDAO
{
  public PasswordHashingDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // get password prop info, check if exists and is set
    PropertyInfo prop = (PropertyInfo) obj.getClassInfo().getAxiomByName("password");
    if ( prop == null || ! prop.isSet(obj) ) {
      return super.put_(x, obj);
    }

    Object id = obj.getProperty("id");
    FObject result = getDelegate().find(id);
    // hash password if result does not exist or does not have password set
    if ( result == null || ! prop.isSet(result) ) {
      prop.set(obj, Password.hash((String) prop.get(obj)));
      return super.put_(x, obj);
    }

    // check if incoming password equals stored password
    String pass1 = (String) prop.get(obj);
    String pass2 = (String) prop.get(result);
    if ( ! pass1.equals(pass2) || ! Password.verify(pass1, pass2) ) {
      throw new RuntimeException("Illegal change of password");
    }

    return super.put_(x, obj);
  }
}