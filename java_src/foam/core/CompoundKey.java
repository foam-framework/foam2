package foam.core;

public class CompoundKey implements Comparable {
  private PropertyInfo[] properties_;
  private Object[] values_;

  public CompoundKey(Object[] values, PropertyInfo[] properties) {
    values_ = values;
    properties_ = properties;
  }

  public Object[] getValues() {
    return values_;
  }

  public int compareTo(Object o) {
    CompoundKey other = (CompoundKey)o;

    int result;
    for ( int i = 0 ; i < properties_.length ; i++ ) {
      result = properties_[i].compare(this, other);
      if ( result != 0 ) return result;
    }
    return 0;
  }

  public String toString() {
    StringBuilder out = new StringBuilder();
    out.append("[");
    for ( int i = 0 ; i < getValues().length ; i++ ) {
      out.append(getValues()[i]);
      out.append("||");
    }
    out.append("]");
    return out.toString();
  }
}
