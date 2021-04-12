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
    this(root, parent, new ProxyX());
  }

  public SubX(Supplier<X> root, String parent, X delegate) {
    root_ = root;
    parent_ = parent;
    setX(delegate);
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
    if ( getX() instanceof ProxyX ) {
      getX().put(key, value);
      return this;
    }
    return new SubX(root_, parent_, new ProxyX(getX())).put(key, value);
  }

  @Override
  public X putFactory(Object key, XFactory factory) {
    if ( getX() instanceof ProxyX ) {
      getX().putFactory(key, factory);
      return this;
    }
    return new SubX(root_, parent_, new ProxyX(getX())).putFactory(key, factory);
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
