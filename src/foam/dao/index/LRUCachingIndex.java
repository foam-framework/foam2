/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

public class LRUCachingIndex
    extends ProxyIndex
{
  protected LRUCachingState head_;
  protected LRUCachingState tail_;

  public LRUCachingIndex(Index index) {
    setDelegate(index);
  }

  @Override
  public Object wrap(Object state) {
    return state;
  }

  public Object unwrap(Object state) {
    LRUCachingState cache = (LRUCachingState) state;
    if ( cache.getValue() == null ) {
      cache.setValue(getDelegate().unwrap(state));
    }

    // get previous node of cached node
    // set the next node of the previous node
    // to the next node of the cached node
    LRUCachingState prev = cache.getPrev();
    if ( prev != null ) {
      prev.setNext(cache.getNext());
    }

    // set cached node to be head
    cache.setPrev(null);
    cache.setNext(head_);
    if ( head_ != null ) {
      head_.setPrev(cache);
    }
    head_ = cache;
    return cache.getValue();
  }
}