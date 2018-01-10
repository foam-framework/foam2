/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;

public abstract class AbstractDoublePropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(double d1, double d2) {
    return Double.compare(d1, d2);
  }

  public Object fromString(String value) {
    return Double.valueOf(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Double.parseDouble(reader.getText());
  }
}
