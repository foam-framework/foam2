/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.crypto.hash.Hasher;
import foam.nanos.logger.Logger;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.security.MessageDigest;
import java.util.Iterator;
import java.util.List;

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
      while ( reader.hasNext() ) {
        int eventType;
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            if (reader.getLocalName() == "object") {
              obj = XMLSupport.createObj(x, reader);
              return obj;
            }
          case XMLStreamConstants.END_ELEMENT:
            break;
        }
      }
    } catch ( XMLStreamException ex) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Premature end of xml file while reading property", this.getName());
    }
    return obj;
  }

  @Override
  public void toXML(FObject obj, Document doc, Element objElement) {
    Object nestObj = this.f(obj);
    if ( nestObj == null ) return;
    Element objTag = doc.createElement(this.getName());
    objElement.appendChild(objTag);
    XMLSupport.toXML((FObject) nestObj, doc, objTag);
  }

  @Override
  public void hash(FObject obj, MessageDigest md) {
    FObject val = (FObject) get(obj);
    List props = val.getClassInfo().getAxiomsByClass(Hasher.class);
    Iterator i = props.iterator();
    while ( i.hasNext() ) {
      Hasher prop = (Hasher) i.next();
      prop.hash(val, md);
    }
  }
}
