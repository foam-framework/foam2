/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.nanos.logger.Logger;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.security.MessageDigest;
import java.security.Signature;
import java.security.SignatureException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public abstract class AbstractFObjectArrayPropertyInfo
    extends AbstractArrayPropertyInfo {

  @Override
  public Object fromString(String value) {
    //TODO
    return null;
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

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    FObject[] val = (FObject[]) this.get(obj);
    if ( val == null || val.length == 0 ) return;

    List props = val[0].getClassInfo().getAxiomsByClass(PropertyInfo.class);
    for ( FObject o : val ) {
      Iterator i = props.iterator();
      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        if ( ! prop.includeInDigest() ) continue;
        if ( ! prop.isSet(o) ) continue;
        if ( prop.isDefaultValue(o) ) continue;
        md.update(prop.getNameAsByteArray());
        prop.updateDigest(o, md);
      }
    }
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    FObject[] val = (FObject[]) this.get(obj);
    if ( val == null || val.length == 0 ) return;

    List props = val[0].getClassInfo().getAxiomsByClass(PropertyInfo.class);
    for ( FObject o : val ) {
      Iterator i = props.iterator();
      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        if ( ! prop.includeInSignature() ) continue;
        if ( ! prop.isSet(o) ) continue;
        if ( prop.isDefaultValue(o) ) continue;
        sig.update(prop.getNameAsByteArray());
        prop.updateSignature(o, sig);
      }
    }
  }
}
