/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public abstract class AbstractMultiPartIDPropertyInfo
  extends AbstractObjectPropertyInfo
{
  public abstract foam.core.PropertyInfo[] getProperties();

  @Override
  public Object fromString(String value) {
    foam.core.PropertyInfo[] properties = getProperties();
    if ( properties.length == 1 ) {
      return properties[0].fromString(value);
    }

    String[] parts = foam.util.StringUtil.split(value, ',');
    if ( parts.length != properties.length ) {
      throw new RuntimeException("Multi part key is wrong length.  Expected " + properties.length + " got " + parts.length);
    }

    Object[] values = new Object[properties.length];

    for ( int i = 0 ; i < parts.length ; i++ ) {
      values[i] = properties[i].fromString(parts[i]);
    }

    return new foam.core.CompoundKey(values, properties);
  }

  @Override
  public void cloneProperty(FObject source, FObject dest) {
    // No need to clone, not backed by any real storage.
  }
}
