/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

public class LRUCachingIndex
    extends ProxyIndex
{
  protected int size_ = 0;
  protected final int maxSize_;

  protected LRUCachingState head_ = new LRUCachingState();
  protected LRUCachingState tail_ = new LRUCachingState();

  public LRUCachingIndex(int maxSize, Index index) {
    setDelegate(index);
    this.head_.setNext(tail_);
    this.tail_.setPrev(head_);
    this.maxSize_ = maxSize;
  }

  @Override
  public Object wrap(Object state) {
    LRUCachingState cache = new LRUCachingState(getDelegate().wrap(state), state);
    cache.setNext(head_.getNext());
    cache.setPrev(head_);
    head_.setNext(cache);

    // remove oldest entry
    if ( size_ >= maxSize_ ) {
      tail_.getPrev().setValue(null);
      tail_.getPrev().remove();
    } else {
      size_++;
    }

    return cache;
  }

  public Object unwrap(Object state) {
    LRUCachingState cache = (LRUCachingState) state;
    if ( cache.getValue() == null ) {
      cache.setValue(getDelegate().unwrap(cache.getKey()));
    }

    // remove cached node from location
    // and set to be head
    cache.remove();
    cache.setPrev(head_);
    cache.setNext(head_.getNext());
    head_.setNext(cache);
    return cache.getValue();
  }
}