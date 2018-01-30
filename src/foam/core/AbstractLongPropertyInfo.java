/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;
import java.security.MessageDigest;

public abstract class AbstractLongPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(long o1, long o2) {
    return java.lang.Long.compare(o1, o2);
  }

  public Object fromString(String value) {
    return Long.valueOf(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Long.valueOf(reader.getText());
  }

  @Override
  public void hash(FObject obj, MessageDigest md) {
    super.hash(obj, md);
    long val = (long) get(obj);
    md.update(new byte[] {
        (byte)((val & 0xFF00000000000000L) >> 56),
        (byte)((val & 0x00FF000000000000L) >> 48),
        (byte)((val & 0x0000FF0000000000L) >> 40),
        (byte)((val & 0x000000FF00000000L) >> 32),
        (byte)((val & 0x00000000FF000000L) >> 24),
        (byte)((val & 0x0000000000FF0000L) >> 16),
        (byte)((val & 0x000000000000FF00L) >> 8),
        (byte)((val & 0x00000000000000FFL))
    });
  }
}
