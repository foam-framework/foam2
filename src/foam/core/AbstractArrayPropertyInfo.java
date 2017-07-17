/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.nanos.logger.NanoLogger;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import java.lang.UnsupportedOperationException;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.ArrayList;
import java.util.List;


public abstract class AbstractArrayPropertyInfo
  extends AbstractPropertyInfo {

  public int compareValues(boolean b1, boolean b2) {
    return 0;
  }

  @Override
  public void setFromString(Object obj, String value) {
    // TODO
  }

  public abstract String of();

  // NESTED ARRAY
  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    NanoLogger logger = (NanoLogger) x.get("logger");
    List objList = new ArrayList();
    String startTag = reader.getLocalName();
    try {
      int eventType;
      while ( reader.hasNext() ) {
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            // Nested object in array
            if ( reader.getLocalName().equals("object") ) {
              FObject clsInstance = XMLSupport.createObj(x, reader);
              if ( clsInstance != null ) {
                objList.add(clsInstance);
              }
            } else if ( reader.getLocalName().equals("value") ) {
              // TODO: TYPE CASTING FOR PROPER CONVERSION. NEED FURTHER SUPPORT FOR PRIMITIVE TYPES
//              reader.next();
//              String value = reader.getText();
//              String type = this.of();
//              objList.add(value);
              throw new UnsupportedOperationException("Primitive typed array XML reading is not supported yet");
            }
            break;
          case XMLStreamConstants.END_ELEMENT:
            if ( reader.getLocalName() == startTag ) { return objList.toArray(); }
            break;
        }
      }
    } catch (XMLStreamException ex) {
      logger.error("Premature end of XML file")
    }
    return objList.toArray();
  }

  @Override
  public void toXML (FObject obj, Document doc, Element objElement) {
    if ( this.f(obj) == null ) return;

    Element prop = doc.createElement(this.getName());
    objElement.appendChild(prop);

    // FObject Array check
    if ( this.f(obj) instanceof FObject[] ) {
      FObject[] nestedArray = (FObject[]) this.f(obj);
      for ( int j = 0; j < nestedArray.length; j++ ) {
        XMLSupport.toXML(nestedArray[j], doc, prop);
      }
      return;
    } else {
      Object[] nestObj = (Object[]) this.f(obj);
      for ( int j = 0; j < nestObj.length; j++ ) {
        Element nestedProp = doc.createElement("value");
        nestedProp.appendChild(doc.createTextNode(nestObj[j].toString()));
        prop.appendChild(nestedProp);
      }
    }
  }
}