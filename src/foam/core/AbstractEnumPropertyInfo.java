/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.nanos.logger.NanoLogger;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

public abstract class AbstractEnumPropertyInfo
  extends AbstractObjectPropertyInfo {

  public abstract int getOrdinal(Object o);
  public abstract java.lang.Enum forOrdinal(int ordinal);
  public abstract void toJSON(foam.lib.json.Outputter outputter, StringBuilder out, Object value);

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    FObject obj = null;
    NanoLogger logger = (NanoLogger) x.get("logger");
    try {

      while ( reader.hasNext() ) {
        switch ( reader.getEventType() ) {
          case XMLStreamConstants.START_ELEMENT:
            // Enum Specific Case
            if ( reader.getLocalName() == this.getName() ) {
              reader.next();
              Integer ordinalVal = Integer.parseInt(reader.getText());
              return this.forOrdinal(ordinalVal);
            }
          case XMLStreamConstants.END_ELEMENT:
            break;
        }
        reader.next();
      }
    } catch (XMLStreamException ex) {
      logger.error("Premature end of xml file while reading property", this.getName());
    }
    return obj;
  }

  @Override
  public void toXML(FObject obj, Document doc, Element objElement) {
    Object nestObj = this.f(obj);
    Element objTag = doc.createElement(this.getName());
    int ordVal = this.getOrdinal(nestObj);
    objTag.appendChild(doc.createTextNode(Integer.toString(ordVal)));
    objElement.appendChild(objTag);
  }
}

