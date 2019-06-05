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
  protected String putName_;
  protected String findName_;
  protected String removeName_;
  protected String removeAllName_;
  protected String delegateName_;

  public PipelinePMDAO(X x, DAO delegate) {
    super(x, delegate);
    delegateName_ = getDelegate().getClass().getName();
    init();
  }

  void init() {
    createPipeline();
    putName_       = delegateName_ + ":pipePut";
    findName_      = delegateName_ + ":pipeFind";
    removeName_    = delegateName_ + ":pipeRemove";
    removeAllName_ = delegateName_ + ":pipeRemoveAll";
  }

  private void createPipeline() {
    DAO delegate = getDelegate();
    DAO secondaryDelegate;
    if ( delegate instanceof ProxyDAO ) {
      secondaryDelegate = ((ProxyDAO) delegate).getDelegate();
      ((ProxyDAO) delegate).setDelegate(new EndPipelinePMDAO(getX(), secondaryDelegate));
      delegate = ((ProxyDAO) delegate).getDelegate();
      if ( secondaryDelegate instanceof ProxyDAO ) {
        ((ProxyDAO) delegate).setDelegate(new PipelinePMDAO(getX(), secondaryDelegate));
      }
    }
  }

  private void createPM(String name) {
    PM pm = new PM();
    pm.setClassType(PipelinePMDAO.getOwnClassInfo());
    pm.setName(name);
    X pipeX = getX().put("pipePmStart", pm);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    createPM(putName_);
    return super.put_(pipeX, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    createPM(findName_);
    return super.find_(pipeX, id);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    createPM(removeName_);
    return super.remove_(pipeX, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    createPM(removeAllName_);
    super.removeAll_(pipeX, skip, limit, order, predicate);
  }

  public class EndPipelinePMDAO extends ProxyDAO {
    public EndPipelinePMDAO(X x, DAO delegate) {
      super(x, delegate);
    }

    @Override
    public FObject put_(X x, FObject obj) {
      ((PM) getX().get("pipePmStart")).log(x);
      return super.put_(x, obj);
    }

    @Override
    public FObject find_(X x, Object id) {
      ((PM) getX().get("pipePmStart")).log(x);
      return super.find_(x, id);
    } 

    @Override
    public FObject remove_(X x, FObject obj) {
      ((PM) getX().get("pipePmStart")).log(x);
      return super.remove_(x, obj);
    }

    @Override
    public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
      ((PM) getX().get("pipePmStart")).log(x);
      super.removeAll_(x, skip, limit, order, predicate);
    }
  }
}