/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.function.Supplier;

public class SubX extends ProxyX {
  /**
   * Lazy root context accessor
   */
  protected Supplier<X> root_;

  /**
   * Parent path
   */
  protected String parent_;

  public SubX(Supplier<X> root, String parent) {
    setX(new ProxyX());
    root_ = root;
    parent_ = parent;
  }

  private X getParent() {
    var root = root_.get();
    return parent_.isBlank() ? root : root.cd(parent_);
  }

  @Override
  public Object get(X x, Object key) {
    var ret = getX().get(x, key);
    return ret != null ? ret : getParent().get(x, key);
  }

  @Override
  public X put(Object key, Object value) {
    getX().put(key, value);
    return this;
  }

  @Override
  public X putFactory(Object key, XFactory factory) {
    getX().putFactory(key, factory);
    return this;
  }

  @Override
  public int getInt(Object key, int defaultValue) {
    Number i = (Number) getX().get(key);
    if ( i == null ) {
      i = (Number) getParent().get(key);
    }
    return i == null ? defaultValue : i.intValue();
  }

  @Override
  public boolean getBoolean(Object key, boolean defaultValue) {
    Boolean b = (Boolean) getX().get(key);
    if ( b == null ) {
      b = (Boolean) getParent().get(key);
    }
    return b == null ? defaultValue : b;
  }

  @Override
  public Object getInstanceOf(Object value, Class type) {
    var ret = ((FacetManager) get("facetManager")).getInstanceOf(value, type, getX());
    return ret != null ? ret : ((FacetManager) get("facetManager")).getInstanceOf(value, type, getParent());
  }

  @Override
  public <T> T create(Class<T> type, java.util.Map<String, Object> args) {
    var ret = ((FacetManager)get("facetManager")).create(type, args, getX());
    return ret != null ? ret : ((FacetManager)get("facetManager")).create(type, args, getParent());
  }

  @Override
  public X cd(String path) {
    return cd(getX(), path);
  }

  public void freeze() {
    if ( getX() instanceof ProxyX ) {
      setX(((ProxyX) getX()).getX());
    }
  }
}
