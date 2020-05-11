/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;
import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.security.Signature;
import java.security.SignatureException;

public abstract class AbstractShortPropertyInfo
    extends AbstractPropertyInfo
{
  protected static final ThreadLocal<ByteBuffer> bb = new ThreadLocal<ByteBuffer>() {
    @Override
    protected ByteBuffer initialValue() {
      return ByteBuffer.wrap(new byte[2]);
    }

    @Override
    public ByteBuffer get() {
      ByteBuffer bb = super.get();
      bb.clear();
      return bb;
    }
  };

  public int compareValues(short o1, short o2) {
    return Short.compare(o1, o2);
  }

  // public void setFromString(Object obj, String value) {
  //   this.set(obj, Short.valueOf(value));
  // }

  public Object fromString(String value) {
    return Short.valueOf(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Short.valueOf(reader.getText());
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    short val = (short) get(obj);
    md.update((ByteBuffer) bb.get().putShort(val).flip());
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    short val = (short) get(obj);
    sig.update((ByteBuffer) bb.get().putShort(val).flip());
  }
  
  public String getSQLType() {
    return "SMALLINT";
  }
  
  public Class getValueClass() {
    return short.class;
  }
  
  public short cast(Object o) {
    short s = ( o instanceof String ) ? Short.valueOf((String) o) : (short)o;
    return ( o instanceof Number ) ? ((Number)o).shortValue() : s;
  }
  
  public Object get(Object o) {
    return get_(o);
  }

  protected abstract short get_(Object o);
  
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
    return foam.lib.json.ShortParser.instance();
  }

  public foam.lib.parse.Parser queryParser() {
    return foam.lib.json.ShortParser.instance();
  }

  public foam.lib.parse.Parser csvParser() {
    return foam.lib.json.ShortParser.instance();
  }
  
  public boolean isDefaultValue(Object o) {
    return foam.util.SafetyUtil.compare(get_(o), 0) == 0;
  }

  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    formatter.output(get_(obj));
  }
}
