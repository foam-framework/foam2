package foam.core;

public abstract class AbstractBytePropertyInfo extends AbstractPropertyInfo {
  public int compareValues(byte b1, byte b2) {
    return java.lang.Byte.compare(b1, b2);
  }

  public void setFromString(Object obj, String value) {
    this.set(obj, Byte.valueOf(value));
  }
}
