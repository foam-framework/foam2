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

    size_ += 1;
    // remove oldest entry
    if ( size_ >= maxSize_ ) {
      LRUCachingState toRemove = tail_.getPrev();
      LRUCachingState prev = toRemove.getPrev();
      prev.setNext(tail_);
      tail_.setPrev(prev);
      toRemove.setValue(null);
      size_ -= 1;
    }

    return cache;
  }

  public Object unwrap(Object state) {
    LRUCachingState cache = (LRUCachingState) state;
    if ( cache.getValue() == null ) {
      cache.setValue(getDelegate().unwrap(cache.getKey()));
    }

    // get previous node of cached node
    // set the next node of the previous node
    // to the next node of the cached node
    LRUCachingState prev = cache.getPrev();
    prev.setNext(cache.getNext());

    // get next node of cached node
    // set the prev node of the next node
    // to the prev node of the cached node
    LRUCachingState next = cache.getNext();
    next.setPrev(cache.getPrev());

    // set cached node to be head
    cache.setPrev(head_);
    head_.setNext(cache);
    return cache.getValue();
  }
}