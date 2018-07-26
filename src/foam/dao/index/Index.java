/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

import foam.core.FObject;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public interface Index {
  // Called when an Index is added
  public void onAdd(Sink sink);

  // Add or update an object
  public Object put(Object state, FObject value);

  // Remove an object
  public Object remove(Object state, FObject value);

  // Remove all objects
  public Object removeAll();

  // Create a Plan for a find()
  public FindPlan planFind(Object state, Object key);

  // Create a Plan for a select()
  public SelectPlan planSelect(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate);

  // Return number of objects stored in this Index
  public long size(Object state);

  // Wrap an object when stored in this Index
  public Object wrap(Object state);

  // Unwrap an object stored in this Index. o == unwrap(wrap(o))
  public Object unwrap(Object state);

  // Future:
  // toString()
  // bulkLoad()
}
