/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

public class LRUCachingIndex
    extends ProxyIndex
{
  protected LRUCachingState head_ = new LRUCachingState();
  protected LRUCachingState tail_ = new LRUCachingState();

  public LRUCachingIndex(Index index) {
    setDelegate(index);
  }

  @Override
  public Object wrap(Object state) {
    LRUCachingState cache = new LRUCachingState(state, getDelegate().wrap(state));

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

    // get next node of cached node
    // set the prev node of the next node
    // to the prev node of the cached node
    LRUCachingState next = cache.getNext();
    if ( next != null ) {
      next.setPrev(cache.getPrev());
    }

    // set cached node to be head
    cache.setPrev(head_);
    head_.setNext(cache);
    return cache.getValue();
  }
}