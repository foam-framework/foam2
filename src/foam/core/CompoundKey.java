/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

/** A compound/multi-part comparable key. **/
public class CompoundKey
  implements Comparable
{
  protected final PropertyInfo[] properties_;
  protected final Object[]       values_;

  public CompoundKey(Object[] values, PropertyInfo[] properties) {
    values_     = values;
    properties_ = properties;
  }

  public Object[] getValues() { return values_; }

  public int compareTo(Object o) {
    CompoundKey other = (CompoundKey) o;
    int         result;

    for ( int i = 0 ; i < properties_.length ; i++ ) {
      result = properties_[i].compare(this, other);
      if ( result != 0 ) return result;
    }

    return 0;
  }

  public String toString() {
    StringBuilder out = new StringBuilder();

    int len =  getValues().length;
    for ( int i = 0 ; i < len ; i++ ) {
      if ( i > 0 ) out.append("||");
      out.append(getValues()[i]);
    }

    return out.toString();
  }

  @Override
  public boolean equals(Object o) {
    if ( o instanceof CompoundKey ) {
      Object[] v1 = getValues(), v2 = ((CompoundKey) o).getValues();
      if ( v1.length != v2.length ) return false;
      for ( int i = 0 ; i < v1.length ; i++ ) {
        if ( ! v1[i].equals(v2[i]) ) return false;
      }
      return true;
    }
    return false;
  }

  @Override
  public int hashCode() {
    Object[] v = getValues();
    int hash = 17;
    for ( Object aV : v ) hash = 37 * hash + aV.hashCode();
    return hash;
  }
}
