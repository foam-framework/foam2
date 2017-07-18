/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;

public abstract class AbstractBytePropertyInfo
        extends AbstractPropertyInfo
{
  public int compareValues(byte b1, byte b2) {
    return java.lang.Byte.compare(b1, b2);
  }

  @Override
  public void setFromString(Object obj, String value) {
    this.set(obj, Byte.valueOf(value));
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Byte.valueOf(reader.getText());
  }
}
