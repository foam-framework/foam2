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

  protected String putName_;
  protected String findName_;
  protected String removeName_;
  protected String removeAllName_;

/*
  public PMDAO(DAO delegate) {
    setDelegate(delegate);
    init();
    System.err.println("*************************** WARNING: FAILURE TO SET PMDAO CONTEXT IN CONSTRUCTOR!");
  }
*/
  public PMDAO(X x, DAO delegate) {
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
    PM pm = new PM.Builder(x).setClassType(PMDAO.getOwnClassInfo()).setName(putName_).build();

    try {
      return super.put_(x, obj);
    } finally {
      pm.log(x);
    }
  }

  @Override
  public FObject find_(X x, Object id) {
    PM pm = new PM.Builder(x).setClassType(PMDAO.getOwnClassInfo()).setName(findName_).build();

    try {
      return super.find_(x, id);
    } finally {
      pm.log(x);
    }
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    PM pm = new PM.Builder(x).setClassType(PMDAO.getOwnClassInfo()).setName(removeName_).build();

    try {
      return super.remove_(x, obj);
    } finally {
      pm.log(x);
    }
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    PM pm = new PM.Builder(x).setClassType(PMDAO.getOwnClassInfo()).setName(removeAllName_).build();

    try {
      super.removeAll_(x, skip, limit, order, predicate);
    } finally {
      pm.log(x);
    }
  }
}
