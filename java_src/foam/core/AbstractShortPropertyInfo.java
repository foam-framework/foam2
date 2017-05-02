package foam.core;

public abstract class AbstractShortPropertyInfo extends AbstractPropertyInfo {
  public int compareValues(short o1, short o2) {
    return Short.compare(o1, o2);
  }
}
