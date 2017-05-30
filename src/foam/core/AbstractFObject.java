package foam.core;

import java.util.List;
import java.util.Iterator;

public abstract class AbstractFObject
  extends ContextAwareSupport
  implements FObject
{
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
