package foam.core;

public abstract class AbstractObjectPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(Object o1, Object o2) {
    return ((Comparable)o1).compareTo(o2);
  }
}
