/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;

public abstract class AbstractBooleanPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(boolean b1, boolean b2) {
    return Boolean.compare(b1, b2);
  }

  @Override
  public void setFromString(Object obj, String value) {
    this.set(obj, Boolean.parseBoolean(value));
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Boolean.parseBoolean(reader.getText());
  }
}
