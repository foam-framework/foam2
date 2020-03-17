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

public abstract class AbstractFloatPropertyInfo
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

  public int compareValues(float d1, float d2) {
    return Float.compare(d1, d2);
  }

  public Object fromString(String value) {
    return Float.valueOf(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Float.parseFloat(reader.getText());
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    float val = (float) get(obj);
    md.update((ByteBuffer) bb.get().putFloat(val).flip());
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    float val = (float) get(obj);
    sig.update((ByteBuffer) bb.get().putFloat(val).flip());
  }
  
  public String getSQLType() {
    return "FLOAT";
  }
  
  public Class getValueClass() {
    return float.class;
  }
  
  public float cast(Object o) {
    float f = ( o instanceof String ) ? Float.parseFloat((String) o) : (float)o;
    return ( o instanceof Number ) ? ((Number)o).floatValue() : f;
  }
  
  public Object get(Object o) {
    return get_(o);
  }

  protected abstract float get_(Object o);
  
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
    return foam.lib.json.FloatParser.instance();
  }

  public foam.lib.parse.Parser queryParser() {
    return foam.lib.json.FloatParser.instance();
  }

  public foam.lib.parse.Parser csvParser() {
    return foam.lib.json.FloatParser.instance();
  }
  
  public boolean isDefaultValue(Object o) {
    return foam.util.SafetyUtil.compare(get_(o), 0) == 0;
  }

  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    formatter.output(get_(obj));
  }
}
