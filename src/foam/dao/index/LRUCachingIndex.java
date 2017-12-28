/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

public class LRUCachingIndex
    extends ProxyIndex
{
  public LRUCachingIndex(Index index) {
    setDelegate(index);
  }
}