/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;
import java.security.MessageDigest;

public abstract class AbstractBooleanPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(boolean b1, boolean b2) {
    return Boolean.compare(b1, b2);
  }

  public Object fromString(String value) {
    return Boolean.parseBoolean(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Boolean.parseBoolean(reader.getText());
  }

  @Override
  public void hash(FObject obj, MessageDigest md) {
    super.hash(obj, md);
    if ( ! isSet(obj) ) return;
    if ( isDefaultValue(obj) ) return;
    boolean val = (boolean) get(obj);
    md.update((byte) (val ? 1 : 0));
  }
}
