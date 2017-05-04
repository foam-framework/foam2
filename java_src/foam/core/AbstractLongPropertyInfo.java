package foam.core;

public abstract class AbstractLongPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(long o1, long o2) {
    return Long.compare(o1, o2);
  }
}
