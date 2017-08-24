/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;

public abstract class AbstractIntPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(int o1, int o2) {
    return Integer.compare(o1, o2);
  }

  public void setFromString(Object obj, String value) {
    this.set(obj, Integer.valueOf(value));
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Integer.valueOf(reader.getText());
  }
}
