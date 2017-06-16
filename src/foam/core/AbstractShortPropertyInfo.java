package foam.core;

public abstract class AbstractShortPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(short o1, short o2) {
    return java.lang.Short.compare(o1, o2);
  }

  public void setFromString(Object obj, String value) {
    this.set(obj, Short.valueOf(value));
  }
}
