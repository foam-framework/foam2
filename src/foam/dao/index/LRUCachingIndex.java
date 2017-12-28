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
    return state;
  }
}