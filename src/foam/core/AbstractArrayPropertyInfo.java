/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.ArrayList;
import java.util.List;
import java.util.Iterator;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import javax.xml.stream.XMLStreamWriter;

public abstract  class AbstractArrayPropertyInfo
  extends AbstractPropertyInfo
{

  public int compareValues(boolean b1, boolean b2) {
    return 0;
  }

  @Override
  public void setFromString(Object obj, String value) {
    // TODO
  }

  // NESTED ARRAY
  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
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
              // Move to characters TODO
              reader.next();
              String value = reader.getText();
//              String type = this.of();
              objList.add(value);
            }
            break;
          case XMLStreamConstants.END_DOCUMENT:
            if ( reader.getLocalName() == startTag ) { return objList; }
            break;
        }
      }
    } catch (XMLStreamException ex) {
    }
    return objList;
  }

  @Override
  public void toXML (FObject obj, Document dom, Element objElement) {
    List nestedArr = (ArrayList) this.f(obj);
    Iterator i = nestedArr.iterator();

//    try {
//      while ( i.hasNext() ) {
//        // Array of FObjects
//        if ( i.next() instanceof FObject ) {
//          XMLSupport.toXML((FObject) i, writer);
//          continue;
//        }
//        writer.writeStartElement("value");
//        writer.writeCharacters(i.toString());
//        writer.writeEndElement();
//      }
//    } catch (XMLStreamException ex) {
//
//    }
  }
}