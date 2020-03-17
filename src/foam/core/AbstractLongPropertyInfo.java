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

public abstract class AbstractLongPropertyInfo
    extends AbstractPropertyInfo
{
  protected static final ThreadLocal<ByteBuffer> bb = new ThreadLocal<ByteBuffer>() {
    @Override
    protected ByteBuffer initialValue() {
      return ByteBuffer.wrap(new byte[8]);
    }

    @Override
    public ByteBuffer get() {
      ByteBuffer bb = super.get();
      bb.clear();
      return bb;
    }
  };

  public int compareValues(long o1, long o2) {
    return java.lang.Long.compare(o1, o2);
  }

  public Object fromString(String value) {
    return Long.valueOf(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Long.valueOf(reader.getText());
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    long val = (long) get(obj);
    md.update((ByteBuffer) bb.get().putLong(val).flip());
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    long val = (long) get(obj);
    sig.update((ByteBuffer) bb.get().putLong(val).flip());
  }
  
  public String getSQLType() {
    return "BIGINT";
  }
  
  public Class getValueClass() {
    return long.class;
  }
  
  public long cast(Object o) {
    long l = ( o instanceof String ) ? Long.valueOf((String) o) : (long) o;
    return ( o instanceof Number ) ? ((Number) o).longValue() : l;
  }
  
  public Object get(Object o) {
    return get_(o);
  }

  protected abstract long get_(Object o);
  
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
    return foam.lib.json.LongParser.instance();
  }

  public foam.lib.parse.Parser queryParser() {
    return foam.lib.json.LongParser.instance();
  }

  public foam.lib.parse.Parser csvParser() {
    return null;
  }
  
  public boolean isDefaultValue(Object o) {
    return foam.util.SafetyUtil.compare(get_(o), 0) == 0;
  }

  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    formatter.output(get_(obj));
  }
}
