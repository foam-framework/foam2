package foam.core;

public abstract class AbstractIntPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(int o1, int o2) {
    return Integer.compare(o1, o2);
  }
  
  public void setFromString(Object obj, String value) {
    this.set(obj, Integer.valueOf(value));
  }
}
