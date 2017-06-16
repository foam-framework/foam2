package foam.core;

public abstract class AbstractDoublePropertyInfo extends AbstractPropertyInfo {
  public int compareValues(double d1, double d2) {
    return java.lang.Double.compare(d1, d2);
  }

  public void setFromString(Object obj, String value) {
    this.set(obj, Double.parseDouble(value));
  }
}
