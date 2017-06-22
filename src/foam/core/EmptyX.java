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

// TODO: make this a functional tree rather than a linked list. (for performance)

abstract class AbstractX
  implements X
{
  public Object get(Object key) {
    return get(this, key);
  }

  public X put(Object key, Object value) {
    return new XI(this, key, value);
  }

  public X putFactory(Object key, XFactory factory) {
    return new FactoryXI(this, key, factory);
  }

  public Object getInstanceOf(Object value, Class type) {
    return ((FacetManager) get("facetManager")).getInstanceOf(value, type, this);
  }

  public <T> T create(Class<T> type) {
    return ((FacetManager)get("facetManager")).create(type, this);
  }
}


/** Default implementation of X interface. Stores one key-value binding. **/
class XI
  extends AbstractX
{
  final X      parent_;
  final Object key_;
  final Object value_;

  XI(X parent, Object key, Object value) {
    parent_ = parent;
    key_    = key;
    value_  = value;
  }

  X parent() { return parent_; }

  public Object get(X x, Object key) {
    return key.equals(key_) ? value_ : parent().get(key);
  }
}


/** Implementation of X interface when binding a key-factory pair. **/
class FactoryXI
  extends AbstractX
{
  final X        parent_;
  final Object   key_;
  final XFactory factory_;

  FactoryXI(X parent, Object key, XFactory factory) {
    parent_  = parent;
    key_     = key;
    factory_ = factory;
  }

  X parent() {
    return parent_;
  }

  public Object get(X x, Object key) {
    return key.equals(key_) ?
      factory_.create(x)    :
      parent().get(x, key) ;
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
}
