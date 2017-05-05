package foam.core;

public abstract class AbstractBytePropertyInfo extends AbstractPropertyInfo {
  public int compareValues(byte b1, byte b2) {
    return Byte.compare(b1, b2);
  }
}
