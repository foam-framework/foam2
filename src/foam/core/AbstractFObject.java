/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.HashMap;
import java.util.List;
import java.util.Iterator;
import java.util.Map;

public abstract class AbstractFObject
  extends    ContextAwareSupport
  implements FObject
{

  public static FObject maybeClone(FObject fo) {
    return ( fo == null ? null : fo.fclone() );
  }

  public FObject fclone() {
    try {
      FObject ret = (FObject) getClassInfo().getObjClass().newInstance();
      List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
      for( PropertyInfo pi : props ) {
        pi.set(ret, pi.get(this));
      }
      return ret;
    } catch (IllegalAccessException | InstantiationException e) {
      return null;
    }
  }

  public Map diff(FObject obj) {
    List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    Iterator i = props.iterator();

    Map result = new HashMap();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      prop.diff(this, obj, result, prop);
    }

    return result;
  }

  public int compareTo(Object o) {
    if ( o == this ) return 0;
    if ( o == null ) return 1;
    if ( ! ( o instanceof FObject ) ) return 1;

    if ( getClass() != o.getClass() ) {
      return getClassInfo().getId().compareTo(((FObject)o).getClassInfo().getId());
    }

    List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    Iterator i = props.iterator();

    int result;
    while ( i.hasNext() ) {
      result = ((PropertyInfo)i.next()).compare(this, o);
      if ( result != 0 ) return result;
    }

    return 0;
  }

  public FObject setProperty(String prop, Object value) {
    PropertyInfo property = ((PropertyInfo) getClassInfo().getAxiomByName(prop));
    if (property != null) property.set(this, value);
    return this;
  }

  public Object getProperty(String prop) {
    PropertyInfo property = ((PropertyInfo) getClassInfo().getAxiomByName(prop));
    return property == null ? null : property.get(this);
  }
}
