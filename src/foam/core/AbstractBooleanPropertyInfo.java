/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;
import java.security.MessageDigest;
import java.security.Signature;
import java.security.SignatureException;

public abstract class AbstractBooleanPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(boolean b1, boolean b2) {
    return Boolean.compare(b1, b2);
  }

  public Object fromString(String value) {
    return Boolean.parseBoolean(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Boolean.parseBoolean(reader.getText());
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    boolean val = (boolean) get(obj);
    md.update((byte) (val ? 1 : 0));
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    boolean val = (boolean) get(obj);
    sig.update((byte) (val ? 1 : 0));
  }
  
  public String getSQLType() {
    return "BOOLEAN";
  }
  
  public Class getValueClass() {
    return boolean.class;
  }
  
  public boolean cast(Object o) {
    return ((Boolean) o).booleanValue();
  }
  
  public Object get(Object o) {
    return get_(o);
  }
  
  protected abstract boolean get_(Object o);
  
  public int compare(Object o1, Object o2) {
    return foam.util.SafetyUtil.compare(get_(o1), get_(o2));
  }

  public int comparePropertyToObject(Object key, Object o) {
    return foam.util.SafetyUtil.compare(cast(key), get_(o));
  }

  public int comparePropertyToValue(Object key, Object value) {
    return foam.util.SafetyUtil.compare(cast(key), cast(value));
  }
  
  public foam.lib.parse.Parser jsonParser() {
    return foam.lib.json.BooleanParser.instance();
  }

  public foam.lib.parse.Parser queryParser() {
    return foam.lib.json.BooleanParser.instance();
  }

  public foam.lib.parse.Parser csvParser() {
    return foam.lib.json.BooleanParser.instance();
  }
  
  public boolean isDefaultValue(Object o) {
    return foam.util.SafetyUtil.compare(get_(o), true) == 0;
  }
  
  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    formatter.output(get_(obj));
  }
}
