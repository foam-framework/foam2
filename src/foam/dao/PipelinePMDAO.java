/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.FObject;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.pm.PM;

public class PipelinePMDAO
  extends ProxyDAO
{ 
  public PMDAO(X x, DAO delegate) {
    super(x, delegate);
    init();
  }

  void init() {
    createPipeline();
    putName_       = getOf().getId() + ":put";
    findName_      = getOf().getId() + ":find";
    removeName_    = getOf().getId() + ":remove";
    removeAllName_ = getOf().getId() + ":removeAll";
  }

  private void createPipeline() {
    if( getDelagate() instanceof ProxyDAO ) {

    }
  }

  @Override
  public FObject put_(X x, FObject obj) {

    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {

    return super.find_(x, id);
  }

  @Override
  public FObject remove_(X x, FObject obj) {

    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {

    super.removeAll_(x, skip, limit, order, predicate);
  }
}