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
    this.key_ = key;
    this.value_ = value;
    this.next_ = null;
    this.prev_ = null;
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

  public LRUCachingState getNext() {
    return this.next_;
  }

  public void setNext(LRUCachingState next) {
    this.next_ = next;
  }

  public LRUCachingState getPrev() {
    return this.prev_;
  }

  public void setPrev(LRUCachingState prev) {
    this.prev_ = prev;
  }

  public void remove() {
    if ( this.prev_ != null ) this.prev_.setNext(this.next_);
    if ( this.next_ != null ) this.next_.setPrev(this.prev_);
  }
}