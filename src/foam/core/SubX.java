/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.HashSet;
import java.util.Set;
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

  /**
   * Keys of all services added to the subX.
   *
   * Storing {@code serviceKeys} to allow overriding a service as null. Eg,
   * subX.put("group", null) would override "group" as null so that the next
   * subX.get("group") call returns null instead of propagating the lookup of
   * "group" key in the parent context.
   */
  protected Set serviceKeys_;

  /**
   * Key of {@code serviceKeys} to put in the subX
   */
  public static final String SERVICE_KEYS = "_SubX_";

  public SubX(Supplier<X> root, String parent) {
    this(root, parent, new ProxyX());
  }

  public SubX(Supplier<X> root, String parent, X delegate) {
    root_ = root;
    parent_ = parent;

    serviceKeys_ = (Set) delegate.get(SERVICE_KEYS);
    if ( serviceKeys_ == null ) serviceKeys_ = new HashSet();

    setX(delegate.put(SERVICE_KEYS, serviceKeys_));
  }

  private X getParent() {
    var root = root_.get();
    return parent_.isBlank() ? root : root.cd(parent_);
  }

  @Override
  public Object get(X x, Object key) {
    var ret = getX().get(x, key);
    return ret != null || serviceKeys_.contains(key) ? ret
      : getParent().get(x, key);
  }

  @Override
  public X put(Object key, Object value) {
    if ( getX() instanceof ProxyX ) {
      getX().put(key, value);
      serviceKeys_.add(key);
      return this;
    }
    return ((SubX) fclone().put(key, value)).freeze();
  }

  @Override
  public X putFactory(Object key, XFactory factory) {
    if ( getX() instanceof ProxyX ) {
      getX().putFactory(key, factory);
      serviceKeys_.add(key);
      return this;
    }
    return ((SubX) fclone().putFactory(key, factory)).freeze();
  }

  @Override
  public int getInt(Object key, int defaultValue) {
    Number i = (Number) getX().get(key);
    if ( i == null && ! serviceKeys_.contains(key) ) {
      i = (Number) getParent().get(key);
    }
    return i == null ? defaultValue : i.intValue();
  }

  @Override
  public boolean getBoolean(Object key, boolean defaultValue) {
    Boolean b = (Boolean) getX().get(key);
    if ( b == null && ! serviceKeys_.contains(key) ) {
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

  public X freeze() {
    if ( getX() instanceof ProxyX ) {
      setX(((ProxyX) getX()).getX());
    }
    return this;
  }

  /**
   * Remove a service/object from the subX so that {@code subX.get(key)} call
   * can propagate the lookup to the parent context properly.
   *
   * @param key Key to be removed
   * @return SubX
   */
  public X rm(Object key) {
    var subX = (SubX) put(key, null);
    subX.serviceKeys_.remove(key);
    return subX;
  }

  public X fclone() {
    var x = getX();
    while ( x instanceof ProxyX ) {
      x = ((ProxyX) x).getX();
    }

    return new SubX(root_, parent_, new ProxyX(
      x.put(SERVICE_KEYS, new HashSet(serviceKeys_))));
  }
}
