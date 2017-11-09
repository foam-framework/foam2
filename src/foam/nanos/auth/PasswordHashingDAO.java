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
    PropertyInfo prop = (PropertyInfo) obj.getClassInfo().getAxiomByName("password");
    if ( prop != null && prop.get(obj) instanceof String ) {
      prop.set(obj, Password.hash((String) prop.get(obj)));
    }
    return super.put_(x, obj);
  }
}