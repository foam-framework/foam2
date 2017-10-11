/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;

public abstract class AbstractLongPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(long o1, long o2) {
    return java.lang.Long.compare(o1, o2);
  }

  @Override
  public void setFromString(Object obj, String value) {
    this.set(obj, Long.valueOf(value));
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Long.valueOf(reader.getText());
  }
}
