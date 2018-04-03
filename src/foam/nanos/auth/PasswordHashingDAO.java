/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.util.Password;
import foam.util.SafetyUtil;
import java.util.Calendar;

public class PasswordHashingDAO
  extends ProxyDAO
{
  public PasswordHashingDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( sink == null ) sink = new ArraySink();
    PasswordRemovalSink passwordRemovalSink = new PasswordRemovalSink(x, sink);
    super.select_(x, passwordRemovalSink, skip, limit, order, predicate);
    return sink;
  }

  @Override
  public FObject find_(X x, Object id) {
    return Password.sanitize(super.find_(x, id));
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Object  id     = obj.getProperty("id");
    FObject stored = getDelegate().find(id);

    // hash password if result does not exist or does not have password set
    if ( stored == null || SafetyUtil.isEmpty((String) stored.getProperty("password")) ) {
      obj.setProperty("password", Password.hash((String) obj.getProperty("password")));
      obj.setProperty("previousPassword", null);
      obj.setProperty("passwordLastModified", Calendar.getInstance().getTime());
    } else {
      obj.setProperty("password", stored.getProperty("password"));
      obj.setProperty("previousPassword", stored.getProperty("previousPassword"));
      obj.setProperty("passwordLastModified", stored.getProperty("passwordLastModified"));
    }

    // clone result and return copy with no password parameters
    FObject result = super.put_(x, obj);
    return Password.sanitize(result);
  }
}
