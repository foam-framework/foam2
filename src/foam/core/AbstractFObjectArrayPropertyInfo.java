/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.nanos.logger.Logger;
import java.lang.UnsupportedOperationException;
import java.util.ArrayList;
import java.util.List;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

public abstract class AbstractFObjectArrayPropertyInfo
        extends AbstractPropertyInfo {

  public int compareValues(Object[] b1, Object[] b2) {
    if (b1 == b2) return 0;
    if (b2 == null) return 1;
    if (b1 == null) return -1;
    int h1 = b1.hashCode();
    int h2 = b2.hashCode();
    return h1 == h2 ? 0 : h1 > h2 ? 1 : -1;
  }

  @Override
  public void setFromString(Object obj, String value) {
    // TODO
  }

  public abstract String of();

  // NESTED ARRAY
  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    List objList = new ArrayList();
    String startTag = reader.getLocalName();
    try {
      int eventType;
      while (reader.hasNext()) {
        eventType = reader.next();
        switch (eventType) {
          case XMLStreamConstants.START_ELEMENT:
            // Nested object in array
            if (reader.getLocalName().equals("object")) {
              FObject o = XMLSupport.createObj(x, reader);
              if (o != null) {
                objList.add(o);
              }
            }
            break;
          case XMLStreamConstants.END_ELEMENT:
            if (reader.getLocalName() == startTag) {
              return objList.toArray();
            }
        }
      }
    } catch(XMLStreamException ex){
      Logger logger = (Logger) x.get("logger");
      logger.error("Premature end of XML file");
    }
    return objList.toArray();
  }

  @Override
  public void toXML (FObject obj, Document doc, Element objElement) {
    if ( this.f(obj) == null ) return;

    Element prop = doc.createElement(this.getName());
    objElement.appendChild(prop);

    // FObject Array check
    FObject[] nestedArray = (FObject[]) this.f(obj);
    for ( int j = 0; j < nestedArray.length; j++ ) {
      XMLSupport.toXML(nestedArray[j], doc, prop);
    }
    return;
  }
}