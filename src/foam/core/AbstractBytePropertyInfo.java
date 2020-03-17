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

public abstract class AbstractBytePropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(byte b1, byte b2) {
    return java.lang.Byte.compare(b1, b2);
  }

  public Object fromString(String value) {
    return Byte.valueOf(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Byte.valueOf(reader.getText());
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    md.update((byte) get(obj));
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    sig.update((byte) get(obj));
  }
  
  public String getSQLType() {
    return "SMALLINT";
  }
  
  public Class getValueClass() {
    return byte.class;
  }
  
  public byte cast(Object o) {
    byte b = ( o instanceof String ) ? Byte.valueOf((String) o) : (byte)o;
            return ( o instanceof Number ) ? ((Number)o).byteValue() : b;
  }
  
  public Object get(Object o) {
    return get_(o);
  }

  protected abstract byte get_(Object o);
  
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
    return foam.lib.json.ByteParser.instance();
  }

  public foam.lib.parse.Parser queryParser() {
    return foam.lib.json.ByteParser.instance();
  }

  public foam.lib.parse.Parser csvParser() {
    return foam.lib.json.ByteParser.instance();
  }
  
  public boolean isDefaultValue(Object o) {
    return foam.util.SafetyUtil.compare(get_(o), 0) == 0;
  }

  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    formatter.output(get_(obj));
  }
}
