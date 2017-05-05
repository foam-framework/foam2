package foam.core;

public abstract class AbstractStringPropertyInfo extends AbstractPropertyInfo {
  public int compareValues(String o1, String o2) {
    return o1.compareTo(o2);
  }

  public abstract int getWidth();
}
