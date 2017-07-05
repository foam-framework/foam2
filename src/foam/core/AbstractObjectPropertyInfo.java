/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;
import javax.xml.stream.XMLStreamWriter;

public abstract class AbstractObjectPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(Object o1, Object o2) {
    return ((Comparable)o1).compareTo(o2);
  }

  public void setFromString(Object obj, String value) { }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    return "";
  }

  @Override
  public void toXML(FObject obj, Document dom, Element objElement) { }
}
