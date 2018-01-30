/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;
import java.security.MessageDigest;

public abstract class AbstractShortPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(short o1, short o2) {
    return Short.compare(o1, o2);
  }

  // public void setFromString(Object obj, String value) {
  //   this.set(obj, Short.valueOf(value));
  // }

  public Object fromString(String value) {
    return Short.valueOf(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Short.valueOf(reader.getText());
  }

  @Override
  public void hash(FObject obj, MessageDigest md) {
    super.hash(obj, md);
    if ( ! isSet(obj) ) return;
    if ( isDefaultValue(obj) ) return;
    int val = (int) get(obj);
    md.update(new byte[] {
        (byte)((val & 0xFF00) >> 8),
        (byte)((val & 0x00FF))
    });
  }
}
