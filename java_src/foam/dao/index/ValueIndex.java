/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class ValueIndex implements Index {
  
  protected static ValueIndex instance_ = new ValueIndex();
  
  protected FObject value;
  protected Plan plan;
  
  protected ValueIndex() {
    this.value = null;
    this.plan = ValuePlan.instance();
  }
  
  public static ValueIndex instance() {
    return instance_;
  }
  
  public void onAdd(Sink sink) {
  }
  
  public Object get(Object state, Object key) {
    return this.value;
  }
  
  public Object put(Object state, FObject value) {
    this.value = value;
    return this.value;
  }

  public Object remove(Object state, FObject value) {
    this.value = null;
    return this.value;
  }

  public Object removeAll() {
    this.value = null;
    return this.value;
  }

  public FindPlan planFind(Object state, Object key) {
    return (FindPlan)this.plan;
  }

  public SelectPlan planSelect(Object state, Sink sink, int skip, int limit, Comparator order, Predicate predicate) {
    return (SelectPlan)this.plan;
  }

  public long size(Object state) {
    return ( this.value != null ) ? 1 : 0;
  }
  
  public void select(Object state, Sink sink, int skip, int limit, Comparator order, Predicate predicate) {
    if( predicate != null && !predicate.f(this.value) ) return;
    if( skip-- > 0 ) return;
    if( limit <= 0 ) return;
    //We need to check whether we'll do with this detachable parameter inside this index
    sink.put(this.value, null);
  }
  
}
