/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

public abstract class AbstractEnumPropertyInfo
  extends AbstractObjectPropertyInfo {

  public String of() { return ""; }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    FObject obj = null;
    try {

      while ( reader.hasNext() ) {
        int eventType;
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            // Enum Specific Case
            if ( reader.getLocalName() == "ordinal" ) {
              Class cls =  Class.forName(this.of());
              reader.next();
              Integer ordinalVal = Integer.parseInt(reader.getText());
              return ((java.lang.Class<Enum>)cls).getEnumConstants()[ordinalVal];
            }
          case XMLStreamConstants.END_ELEMENT:
            break;
        }
      }
    } catch ( ClassNotFoundException | XMLStreamException ex) {
    }
    return obj;
  }

  @Override
  public void toXML(FObject obj, Document doc, Element objElement) {
    Object nestObj = this.f(obj);
    Element objTag = doc.createElement(this.getName());
    objElement.appendChild(objTag);
    Element enumElement = doc.createElement("ordinal");
    String ordVal = Integer.toString(((Enum) nestObj).ordinal());
    enumElement.appendChild(doc.createTextNode(ordVal));
    objTag.appendChild(enumElement);
  }
}

