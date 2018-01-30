/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;
import java.security.MessageDigest;

public abstract class AbstractIntPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(int o1, int o2) {
    return Integer.compare(o1, o2);
  }

  public Object fromString(String value) {
    return Integer.valueOf(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Integer.valueOf(reader.getText());
  }

  @Override
  public void hash(FObject obj, MessageDigest md) {
    super.hash(obj, md);
    if ( ! isSet(obj) ) return;
    if ( isDefaultValue(obj) ) return;
    int val = (int) get(obj);
    md.update(new byte[] {
        (byte)((val & 0xFF000000) >> 24),
        (byte)((val & 0x00FF0000) >> 16),
        (byte)((val & 0x0000FF00) >> 8),
        (byte)((val & 0x000000FF))
    });
  }
}
