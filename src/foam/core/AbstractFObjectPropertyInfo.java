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
  public void updateDigest(FObject obj, MessageDigest md) {
    FObject val = (FObject) get(obj);
    if ( val == null ) return;

    List props = val.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    Iterator i = props.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      if ( ! prop.isSet(val) ) continue;
      if ( prop.isDefaultValue(val) ) continue;
      md.update(prop.getNameAsByteArray());
      prop.updateDigest(val, md);
    }
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    FObject val = (FObject) get(obj);
    if ( val == null ) return;

    List props = val.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    Iterator i = props.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      if ( ! prop.isSet(val) ) continue;
      if ( prop.isDefaultValue(val) ) continue;
      sig.update(prop.getNameAsByteArray());
      prop.updateSignature(val, sig);
    }
  }

  @Override
  public boolean hardDiff(FObject o1, FObject o2, FObject diff) {
    boolean check = super.hardDiff(o1, o2, diff);
    //check is false only when both the.get(o1) and this.get(o2) are null;
    if ( ! check ) return false;
    
    /**
     * if there are point to the same instance, can not guarantee if there are changed
     * scenario: 
     *  FObject obj = (FOBject) X.get("DAO").find(id);
     *  obj.getFObject().setXXX(foo);
     *  X.get("DAO").put(obj);
     * In this case: the before value inside the model is loss, so can not find difference
     */
    if ( (this.get(o1) == this.get(o2)) ) {
      //shadow copy, since we only use to print to journal
      this.set(diff, this.get(o2));
      return true;
    }

    //compare the diff
    Object d = ((FObject) this.get(o1)).hardDiff((FObject)this.get(o2));
    this.set(diff, d);
    if ( d == null ) return false;
    return true;
  }
}
