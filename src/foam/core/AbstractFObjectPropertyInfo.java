/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import javax.xml.stream.XMLStreamWriter;

public abstract class AbstractFObjectPropertyInfo
        extends AbstractObjectPropertyInfo
{
  //  public int compareValues(FObject o1, FObject o2) {
  //    return o1.compareTo(o2);
  //  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    FObject obj = null;
    try {
      String objClass = reader.getAttributeValue(null, "class");
      Class cls = Class.forName(objClass);
      obj = (FObject) x.create(cls);
      XMLSupport.copyFromXML(x, obj, reader);
    } catch (ClassNotFoundException | XMLStreamException ex) {

    }
    return obj;
  }

  @Override
  public void toXML(FObject obj, Document doc, Element objElement) {
    Object nestObj = this.f(obj);
    XMLSupport.toXML((FObject) nestObj, doc);
  }
}
