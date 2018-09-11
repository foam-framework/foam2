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

import java.io.IOException;

public class ProxyIndex
  extends AbstractIndex
{
  protected Index delegate_;

  public ProxyIndex() {

  }

  public ProxyIndex(Index index) {
    setDelegate(index);
  }

  public Index getDelegate() {
    return delegate_;
  }

  public void setDelegate(foam.dao.index.Index val) {
    delegate_ = val;
  }

  @Override
  public void onAdd(Sink sink) {
    getDelegate().onAdd(sink);
  }

  @Override
  public Object put(Object state, FObject value) {
    return wrap(getDelegate().put(unwrap(state), value));
  }

  @Override
  public Object remove(Object state, FObject value) {
    return wrap(getDelegate().remove(unwrap(state), value));
  }

  @Override
  public Object removeAll() {
    return wrap(getDelegate().removeAll());
  }

  @Override
  public FindPlan planFind(Object state, Object key) {
    return getDelegate().planFind(unwrap(state), key);
  }

  @Override
  public SelectPlan planSelect(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return getDelegate().planSelect(unwrap(state), sink, skip, limit, order, predicate);
  }

  @Override
  public long size(Object state) {
    return getDelegate().size(unwrap(state));
  }

  @Override
  public Object wrap(Object state) {
    return getDelegate().wrap(state);
  }

  @Override
  public Object unwrap(Object state) {
    return getDelegate().unwrap(state);
  }

  @Override
  public void flush(Object state) throws IOException {
    getDelegate().flush(state);
  }
}
