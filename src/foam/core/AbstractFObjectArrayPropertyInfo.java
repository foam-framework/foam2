/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.nanos.logger.Logger;

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
      while ( reader.hasNext() ) {
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            // Nested object in array
            if ( reader.getLocalName().equals("object") ) {
              FObject o = XMLSupport.createObj(x, reader);
              if ( o != null ) {
                objList.add(o);
              }
            }
            break;
          case XMLStreamConstants.END_ELEMENT:
            if ( reader.getLocalName().equals(startTag) ) {
              return objList.toArray();
            }
        }
      }
    } catch(XMLStreamException ex) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Premature end of XML file");
    }
    return objList.toArray();
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
  
  public String getSQLType() {
    return "";
  }
  
  public Object get(Object o) {
    return get_(o);
  }
  
  public int comparePropertyToObject(Object key, Object o) {
    return foam.util.SafetyUtil.compare(cast(key), get_(o));
  }

  protected abstract Object cast(Object key);
  protected abstract Object[] get_(Object o);

  public int comparePropertyToValue(Object key, Object value) {
    return foam.util.SafetyUtil.compare(cast(key), cast(value));
  }

  public boolean isDefaultValue(Object o) {
    return java.util.Arrays.equals(get_(o), null);
  }

  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    formatter.output(get_(obj));
  }
}
