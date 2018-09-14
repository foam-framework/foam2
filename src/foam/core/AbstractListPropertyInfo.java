/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.List;

public abstract class AbstractListPropertyInfo
  extends AbstractObjectPropertyInfo
{

  @Override
  public int compare(Object o1, Object o2) {
    Object v1 = this.get(o1);
    Object v2 = this.get(o2);

    if ( v1 == null & v2 == null ) return 0;
    if ( v2 == null ) return 1;
    if ( v1 == null ) return -1;

    List l1 = (List) v1;
    List l2 = (List) v2;

    // check list sizes
    if ( l1.size() > l2.size() ) return 1;
    if ( l1.size() < l2.size() ) return -1;

    // check if lists are equal, if not return -1 suggesting the 2nd list is newer
    if ( l1.containsAll(l2) && l2.containsAll(l2) ) return 0;
    return Integer.compare(l1.hashCode(), l2.hashCode());
  }
}
