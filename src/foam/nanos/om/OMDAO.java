/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.om;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class OMDAO
  extends ProxyDAO
{

  protected String putName_;
  protected String findName_;
  protected String removeName_;
  protected String removeAllName_;

  public OMDAO(X x, DAO delegate) {
    super(x, delegate);
    init();
  }

  void init() {
    putName_       = getOf().getId() + ":put";
    findName_      = getOf().getId() + ":find";
    removeName_    = getOf().getId() + ":remove";
    removeAllName_ = getOf().getId() + ":removeAll";
  }

  @Override
  public FObject put_(X x, FObject obj) {
    OM om = new OM.Builder(x).setClassType(OMDAO.getOwnClassInfo()).setName(putName_).build();

    try {
      return super.put_(x, obj);
    } finally {
      om.log(x);
    }
  }

  @Override
  public FObject find_(X x, Object id) {
    OM om = new OM.Builder(x).setClassType(OMDAO.getOwnClassInfo()).setName(findName_).build();

    try {
      return super.find_(x, id);
    } finally {
      om.log(x);
    }
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    OM om = new OM.Builder(x).setClassType(OMDAO.getOwnClassInfo()).setName(removeName_).build();

    try {
      return super.remove_(x, obj);
    } finally {
      om.log(x);
    }
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    OM om = new OM.Builder(x).setClassType(OMDAO.getOwnClassInfo()).setName(removeAllName_).build();

    try {
      super.removeAll_(x, skip, limit, order, predicate);
    } finally {
      om.log(x);
    }
  }
}
