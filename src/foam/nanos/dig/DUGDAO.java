/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.JDAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.Auth;

/** Execute DUGs on startup or when first put(). Set DUG.owner to creator. **/
public class DUGDAO
  extends ProxyDAO
{
  public DUGDAO(X x) {
    this(x, new JDAO(x, DUG.getOwnClassInfo(), "dugs"));
  }

  public DUGDAO(X x, DAO delegate) {
    super(x, delegate);
    delegate.select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        ((DUG) obj).execute(Auth.sudo(x, ((DUG) obj).getOwner()));
      }
    });
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    ((DUG) obj).setOwner(user.getId());
    ((DUG) obj).execute(x);
    return super.put_(x, obj);
  }
}
