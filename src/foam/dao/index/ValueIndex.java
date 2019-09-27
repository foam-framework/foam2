/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class ValueIndex
  extends AbstractIndex
{

  protected static ValueIndex instance_ = new ValueIndex();

  protected Plan plan = ValuePlan.instance();


  public static ValueIndex instance() {
    return instance_;
  }

  public void onAdd(Sink sink) {
  }

  public Object put(Object state, FObject value) {
    return value;
  }

  public Object remove(Object state, FObject value) {
    return null;
  }

  public Object removeAll() {
    return null;
  }

  public FindPlan planFind(Object state, Object key) {
    return (FindPlan) plan;
  }

  public SelectPlan planSelect(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return (SelectPlan) plan;
  }

  public long size(Object state) {
    return state == null ? 0 : 1;
  }

  public void select(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( predicate != null && ! predicate.f((FObject) state) ) return;
    if ( skip > 0 ) return;
    if ( limit <= 0 ) return;
    // We need to check whether we'll do with this detachable parameter inside this index
    sink.put(state, null);
  }

}
