/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.lib.json.OutputJSON;
import foam.lib.json.UnknownFObject;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
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

  public foam.core.ClassInfo of() {
    return new foam.core.EmptyClassInfo();
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    FObject obj = null;
    try {
      while ( reader.hasNext() ) {
        int eventType;
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            if (reader.getLocalName().equals("object")) {
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
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    FObject val = (FObject) get(obj);
    if ( val == null ) return;

    List props = val.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    Iterator i = props.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      if ( ! prop.includeInDigest() ) continue;
      if ( prop.getStorageTransient() ) continue;
      if ( prop.getClusterTransient() ) continue;
      md.update(prop.getNameAsByteArray());
      prop.updateDigest(val, md);
    }
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    FObject val = (FObject) get(obj);
    if ( val == null ) return;

    List props = val.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    Iterator i = props.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      if ( ! prop.includeInSignature() ) continue;
      if ( prop.getStorageTransient() ) continue;
      if ( prop.getClusterTransient() ) continue;
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
     * If there are point to the same instance, can not guarantee if there are changed
     * scenario:
     *  FObject obj = (FOBject) X.get("DAO").find(id);
     *  obj.getFObject().setXXX(foo);
     *  X.get("DAO").put(obj);
     * In this case: the before value inside the model is loss, so can not find difference
     */
    Object fo1 = this.get(o1), fo2 = this.get(o2);
    if ( fo1 == fo2 || ( ( fo1 == null ) != ( fo2 == null ) ) ) {
      // shadow copy, since we only use to print to journal
      this.set(diff, fo2);
      return true;
    }

    // compare the diff
    Object d = ((FObject) this.get(o1)).hardDiff((FObject)this.get(o2));
    this.set(diff, d);
    return d != null;
  }

  @Override
  public void validateObj(X x, FObject obj) {
    if ( isSet(obj) && getRequired() ) {
      var value = get(obj);
      if ( value != null ) {
        ((FObject) value).validate(x);
      }
    }
  }

  public String getSQLType() {
    return "";
  }

  public boolean isDefaultValue(Object o) {
    return foam.util.SafetyUtil.compare(get_(o), null) == 0;
  }

  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    Object propObj = get_(obj);
    if ( propObj instanceof FObject && ! (propObj instanceof OutputJSON) ) {
      formatter.output((FObject) propObj, of());
    }
    else {
      formatter.output(propObj);
    }
  }

  public int compare(Object o1, Object o2) {
    return foam.util.SafetyUtil.compare(get_(o1), get_(o2));
  }

  public int comparePropertyToObject(Object key, Object o) {
    return foam.util.SafetyUtil.compare(cast(key), get_(o));
  }

  public int comparePropertyToValue(Object key, Object value) {
    return foam.util.SafetyUtil.compare(cast(key), cast(value));
  }
}
