/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.util.SafetyUtil;

import java.util.Map;

public abstract class AbstractMapPropertyInfo
  extends AbstractObjectPropertyInfo
{
  @Override
  public int compare(Object o1, Object o2) {
    Object values1 = this.get(o1);
    Object values2 = this.get(o2);
    if ( values1 == null && values2 == null ) return 0;
    if ( values2 == null ) return 1;
    if ( values1 == null ) return -1;

    Map m1 = (Map) values1;
    Map m2 = (Map) values2;
    
    if ( m1.size() > m2.size() ) return 1;
    if ( m1.size() < m2.size() ) return -1;
    
    int result;
    Object v1;
    Object v2;
    for ( Object key : m1.keySet() ) {
      v1 = m1.get(key);
      v2 = m2.get(key);
      if ( v1 == null && v2 == null ) continue;
      if ( v2 == null ) return 1;
      if ( v1 == null ) return -1;
      if ( v1 instanceof Comparable )
        result = ((Comparable) v1).compareTo(v2);
      else if ( v1.getClass().isArray() )
        result = SafetyUtil.compare((Object[]) v1, (Object[]) v2);
      else
        //compare if refer to the same object
        //will help when value is a static value
        result = v1.equals(v2) ? 0 : -1;
      if ( result != 0 ) return result;
    }
    return 0;
  }
  
  public String getSQLType() {
    return "";
  }
}
