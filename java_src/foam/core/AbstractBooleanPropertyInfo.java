package foam.core;

public abstract class AbstractBooleanPropertyInfo extends AbstractPropertyInfo {
  public int compareValues(boolean b1, boolean b2) {
    return Boolean.compare(b1, b2);
  }
}
