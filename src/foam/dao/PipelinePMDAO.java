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

  /** Calls a method to create the PM pipeline and sets the name variables of each operation of interest */
  void init() {
    createPipeline();
    putName_       = getOf().getId() + ":" + delegateName_ + ":pipePut";
    findName_      = getOf().getId() + ":" + delegateName_ + ":pipeFind";
    removeName_    = getOf().getId() + ":" + delegateName_ + ":pipeRemove";
    removeAllName_ = getOf().getId() + ":" + delegateName_ + ":pipeRemoveAll";
  }

  /** Creates the PM pipeline by adding an EndPipelinePMDAO after of this class only if it is a ProxyDAO. 
  *   If the delegate of that is also a ProxyDAO, creates a new PipelinedPMDAO in the chain beofre it which repeats this procedure recursively. */
  void createPipeline() {
    DAO delegate = getDelegate();
    DAO secondaryDelegate;
    secondaryDelegate = ((ProxyDAO) delegate).getDelegate();
    ((ProxyDAO) delegate).setDelegate(new EndPipelinePMDAO(getX(), secondaryDelegate));
    delegate = ((ProxyDAO) delegate).getDelegate();
    if ( secondaryDelegate instanceof ProxyDAO ) {
      ((ProxyDAO) delegate).setDelegate(new PipelinePMDAO(getX(), secondaryDelegate));
    }
  }

  /** Creates the PM that will measure the performance of each operation and creates a new context with it as a variable which the EndPipelinePMDAO
   *  will use to access the pm after it is passed onto it through the arguments of the DAO operations */
  X createPMX(String name, X x) {
    PM pm = new PM();
    pm.setClassType(PipelinePMDAO.getOwnClassInfo());
    pm.setName(name);
    return x.put("pipePmStart", pm);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    return super.put_(createPMX(putName_, x), obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    return super.find_(createPMX(findName_, x), id);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    return super.remove_(createPMX(removeName_, x), obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    super.removeAll_(createPMX(removeAllName_, x), skip, limit, order, predicate);
  }

  class EndPipelinePMDAO extends ProxyDAO {
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