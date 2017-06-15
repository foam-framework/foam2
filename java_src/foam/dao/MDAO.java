/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.index.AltIndex;
import foam.dao.index.Index;
import foam.dao.index.Plan;
import foam.dao.index.SelectPlan;
import foam.dao.index.TreeIndex;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.mlang.predicate.True;

public class MDAO extends AbstractDAO {
  
  protected ClassInfo of_;
  protected Index index;
  protected Object state;
  
  public MDAO(ClassInfo of_) {
    this.of_ = of_;
    state = null;
    index = new AltIndex(new TreeIndex((PropertyInfo) this.of_.getAxiomByName("id")));
  }
  
  public void addIndex(PropertyInfo prop) {
    if ( ! (index instanceof AltIndex) ) {
      this.index = new AltIndex(this.index);
    }
    ((AltIndex) index).addIndex(new TreeIndex(prop));
  }
  
  public FObject put(FObject obj) {
    FObject oldValue = find(obj);
    if ( oldValue != null ) {
      index.remove(state, oldValue);
    }
    state = index.put(state, obj);
    return obj;
  }

  public FObject remove(FObject obj) {
    if ( obj == null ) {
      return null;
    }
    FObject found = find(obj);
    if ( found != null ) {
      state = index.remove(state, obj);
    }
    return obj;
  }

  public FObject find(Object id) {
    if ( id == null ) {
      return null;
    }
    return (FObject)index.get(state, id);
  }

  public Sink select(Sink sink, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    Plan plan = index.planSelect(state, sink, skip, limit, order, predicate);
    
    if ( plan instanceof SelectPlan ) {
      ((SelectPlan) plan).select(state, sink, skip, limit, order, predicate);
    }
    
    sink.eof();
    return sink;
  }
  

  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    state = null;
  }
  
}
