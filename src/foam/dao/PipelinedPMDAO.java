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

public class PipelinedPMDAO
  extends PMDAO
{

  protected PM chainPM;
  protected PipelinedPMDAO chainStart_;
  
    public PipelinedPMDAO(X x, DAO delegate) {
        super(x, delegate);
        chainStart_ = null;
    }

    public setChainStart(PipelinedPMDAO chainStart) {
        chainStart_ = chainStart;
    }

    @Override
    public FObject put_(X x, FObject obj) {
        if(chainStart_ == null)
            chainPM = new PM.Builder(x).setClassType(PMDAO.getOwnClassInfo()).setName(putName_).build();
        else
            chainStart_.chainPM.log(x);
        return super.put_(x, obj);
    }

    @Override
    public FObject find_(X x, Object id) {
        PM pm;
        if(chainStart_ == null)
            chainPM = new PM.Builder(x).setClassType(PMDAO.getOwnClassInfo()).setName(putName_).build();
        else
            chainStart_.chainPM.log(x);
        return super.find_(x, id);
    }

    @Override
    public FObject remove_(X x, FObject obj) {
        PM pm;
        if(chainStart_ == null)
            chainPM = new PM.Builder(x).setClassType(PMDAO.getOwnClassInfo()).setName(putName_).build();
        else
            chainStart_.chainPM.log(x);
        return super.remove_(x, obj);
    }

    @Override
    public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
        if(chainStart_ == null)
            chainPM = new PM.Builder(x).setClassType(PMDAO.getOwnClassInfo()).setName(putName_).build();
        else
            chainStart_.chainPM.log(x);
        super.removeAll_(x, skip, limit, order, predicate);
    }

}