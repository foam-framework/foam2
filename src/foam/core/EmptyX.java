/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package foam.core;

import java.util.Collections;
import java.util.Map;

// TODO: make this a functional tree rather than a linked list. (for performance)

abstract class AbstractX
  implements X, Cloneable
{
  public Object get(Object key) {
    return get(this, key);
  }

  public int getInt(Object key) {
    return getInt(key, 0);
  }

  public int getInt(Object key, int defaultValue) {
    return getInt(this, key, defaultValue);
  }

  public int getInt(X x, Object key, int defaultValue) {
    Number i = (Number) x.get(key);

    return i == null ? defaultValue : i.intValue();
  }

  public X put(Object key, Object value) {
    String okey = getKey().toString();
    String nkey = key.toString();
    if ( nkey.compareTo(okey) == 0 ) {
      return new XI(getLeftParent(), getRightParent(), getKey(), value);
    } else if ( nkey.compareTo(okey) < 0 ) {
      return clone(getLeftParent().put(key, value), getRightParent());
    } else {
      return clone(getLeftParent(), getRightParent().put(key, value));
    }
  }

  public X putFactory(Object key, XFactory factory) {
    String okey = getKey().toString();
    String nkey = key.toString();
    if ( nkey.compareTo(okey) == 0 ) {
      return new FactoryXI(getLeftParent(), getRightParent(), getKey(), factory);
    } else if ( nkey.compareTo(okey) < 0 ) {
      return clone(getLeftParent().putFactory(key, factory), getRightParent());
    } else {
      return clone(getLeftParent(), getRightParent().putFactory(key, factory));
    }
  }

  public Object getInstanceOf(Object value, Class type) {
    return ((FacetManager) get("facetManager")).getInstanceOf(value, type, this);
  }

  public <T> T create(Class<T> type) {
    return create(type, Collections.<String, Object>emptyMap());
  }

  public <T> T create(Class<T> type, Map<String, Object> args) {
    return ((FacetManager)get("facetManager")).create(type, args, this);
  }

  private X clone(X left, X right) {
    AbstractX result = this.clone();
    result.setLeftParent(left);
    result.setRightParent(right);
    return result;
  }

  @Override 
  protected AbstractX clone() {
    AbstractX x = null;
    try {
      x = (AbstractX) super.clone();
    } catch ( CloneNotSupportedException e ) {
      e.printStackTrace();
    }
    return x;
  }

  abstract protected Object getKey();
  abstract protected X getLeftParent();
  abstract protected X getRightParent();
  abstract protected void setLeftParent(X leftParent);
  abstract protected void setRightParent(X rightParent);
}


/** Default implementation of X interface. Stores one key-value binding. **/
class XI
  extends AbstractX
{
  X             leftParent_;
  X             rightParent_;
  final Object  key_;
  final Object  value_;

  XI(X leftParent, X rightParent, Object key, Object value) {
    leftParent_   = leftParent;
    rightParent_  = rightParent;
    key_          = key;
    value_        = value;
  }

  protected Object getKey() { return key_; }
  protected X getLeftParent() { return leftParent_; }
  protected X getRightParent() { return rightParent_; }
  protected void setLeftParent(X leftParent) { leftParent_ = leftParent; }
  protected void setRightParent(X rightParent) { rightParent_ = rightParent; }

  public Object get(X x, Object key) {
    String okey = getKey().toString();
    String nkey = key.toString();
    if ( nkey.compareTo(okey) == 0 ) {
      return value_;
    } else if ( nkey.compareTo(okey) < 0 ) {
      return getLeftParent().get(x, key);
    } else {
      return getRightParent().get(x, key);
    }
  }
}


/** Implementation of X interface when binding a key-factory pair. **/
class FactoryXI
  extends AbstractX
{
  X               leftParent_;
  X               rightParent_;
  final Object    key_;
  final XFactory  factory_;

  FactoryXI(X leftParent, X rightParent, Object key, XFactory factory) {
    leftParent_   = leftParent;
    rightParent_  = rightParent;
    key_          = key;
    factory_      = factory;
  }

  protected Object getKey() { return key_; }
  protected X getLeftParent() { return leftParent_; }
  protected X getRightParent() { return rightParent_; }
  protected void setLeftParent(X leftParent) { leftParent_ = leftParent; }
  protected void setRightParent(X rightParent) { rightParent_ = rightParent; }

  public Object get(X x, Object key) {
    String okey = getKey().toString();
    String nkey = key.toString();
    if ( nkey.compareTo(okey) == 0 ) {
      return factory_.create(x);
    } else if ( nkey.compareTo(okey) < 0 ) {
      return getLeftParent().get(x, key);
    } else {
      return getRightParent().get(x, key);
    }
  }
}


/** Empty Context. Used to create new contexts. **/
public class EmptyX
  extends AbstractX
{
  private static X x_ = new EmptyX().put("facetManager", new SimpleFacetManager());

  private EmptyX() {}

  public static X instance() { return x_; }

  public Object get(X x, Object key) { return null; }

  public X put(Object key, Object value) {
    return new XI(this, this, key, value);
  }

  public X putFactory(Object key, XFactory factory) {
    return new FactoryXI(this, this, key, factory);
  }

  protected Object getKey() { throw new UnsupportedOperationException("Unsupported operation: getKey"); }
  protected X getLeftParent() { throw new UnsupportedOperationException("Unsupported operation: getLeftParent"); }
  protected X getRightParent() { throw new UnsupportedOperationException("Unsupported operation: getRightParent"); }
  protected void setLeftParent(X left) { throw new UnsupportedOperationException("Unsupported operation: setLeftParent"); }
  protected void setRightParent(X right) { throw new UnsupportedOperationException("Unsupported operation: setRightParent"); }
}
