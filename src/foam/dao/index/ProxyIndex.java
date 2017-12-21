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

public class ProxyIndex
    implements Index
{
  protected Index delegate_;
  private boolean delegateIsSet_ = false;

  public ProxyIndex(Index index) {
    setDelegate(index);
  }

  public Index getDelegate() {
    if ( ! delegateIsSet_ ) {
      return null;
    }
    return delegate_;
  }

  public void setDelegate(foam.dao.index.Index val) {
    delegate_ = val;
    delegateIsSet_ = true;
  }

  @Override
  public void onAdd(Sink sink) {
    getDelegate().onAdd(sink);
  }

  @Override
  public Object put(Object state, FObject value) {
    return getDelegate().put(state, value);
  }

  @Override
  public Object remove(Object state, FObject value) {
    return getDelegate().remove(state, value);
  }

  @Override
  public Object removeAll() {
    return getDelegate().removeAll();
  }

  @Override
  public FindPlan planFind(Object state, Object key) {
    return getDelegate().planFind(state, key);
  }

  @Override
  public SelectPlan planSelect(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return getDelegate().planSelect(state, sink, skip, limit, order, predicate);
  }

  @Override
  public long size(Object state) {
    return getDelegate().size(state);
  }
}