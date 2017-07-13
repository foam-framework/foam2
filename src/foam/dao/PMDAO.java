/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.FObject;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.pm.PM;

public class PMDAO
  extends ProxyDAO
{

  public PMDAO(X x, DAO delegate) {
    super(delegate);
    setX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    PM pm = new PM(PMDAO.class, getOf().getId() + ":put");

    try {
      return super.put_(x, obj);
    } finally {
      pm.log(getX());
    }
  }

  @Override
  public FObject find_(X x, Object id) {
    PM pm = new PM(PMDAO.class, getOf().getId() + ":find");

    try {
      return super.find_(x, id);
    } finally {
      pm.log(getX());
    }
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    PM pm = new PM(PMDAO.class, getOf().getId() + ":remove");

    try {
      return super.remove_(x, obj);
    } finally {
      pm.log(getX());
    }
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    // Is this the right key to use?
    PM pm = new PM(PMDAO.class, getOf().getId() + ":removeAll");

    try {
      super.removeAll_(x, skip, limit, order, predicate);
    } finally {
      pm.log(getX());
    }
  }
}
