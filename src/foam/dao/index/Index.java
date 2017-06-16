/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

import foam.core.FObject;
import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import java.util.Comparator;

public interface Index {
  // Called when an Index is added 
  public void onAdd(Sink sink);

  public Object put(Object state, FObject value);
  public Object remove(Object state, FObject value);
  public Object removeAll();
  public FindPlan planFind(Object state, Object key);
  public SelectPlan planSelect(Object state, Sink sink, int skip, int limit, Comparator order, Predicate predicate);
  public long size(Object state);

  // Future:
  // toString()
  // bulkLoad()
}
