/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

public class LRUCachingState {

  protected LRUCachingState next_;
  protected LRUCachingState prev_;

  protected Object key_;
  protected Object value_;

  public LRUCachingState() {
    this(null, null);
  }

  public LRUCachingState(Object key, Object value) {
    this(key, value, null, null);
  }

  public LRUCachingState(Object key, Object value, LRUCachingState next, LRUCachingState prev) {
    this.key_ = key;
    this.value_ = value;
    this.next_ = next;
    this.prev_ = prev;
  }

  public Object getKey() {
    return this.key_;
  }

  public void setKey(Object key) {
    this.key_ = key;
  }

  public Object getValue() {
    return this.value_;
  }

  public void setValue(Object value) {
    this.value_ = value;
  }

  public void setNext(foam.dao.index.LRUCachingState next) {
    this.next_ = next;
  }

  public void setPrev(foam.dao.index.LRUCachingState prev) {
    this.prev_ = prev;
  }
}