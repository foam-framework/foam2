package foam.core;

import java.util.List;
import java.util.Iterator;

public abstract class AbstractFObject
  extends ContextAwareSupport
  implements FObject
{
  public FObject fclone() {
    FObject ret;
    try {
      ret = (FObject) getClassInfo().getObjClass().newInstance();
    } catch (InstantiationException | IllegalAccessException e) {
      e.printStackTrace();
      return null;
    }

    List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    for(PropertyInfo pi : props) {
      pi.set(ret, pi.get(this));
    }

    return ret;
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
}
