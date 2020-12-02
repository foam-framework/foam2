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

public abstract class AbstractDoublePropertyInfo
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

  public int compareValues(double d1, double d2) {
    return Double.compare(d1, d2);
  }

  public Object fromString(String value) {
    return Double.valueOf(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Double.parseDouble(reader.getText());
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    double val = (double) get(obj);
    md.update((ByteBuffer) bb.get().putDouble(val).flip());
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    double val = (double) get(obj);
    sig.update((ByteBuffer) bb.get().putDouble(val).flip());
  }
  
  public String getSQLType() {
    return "DOUBLE PRECISION";
  }
  
  public Class getValueClass() {
    return double.class;
  }
  
  public double cast(Object o) {
    double d = ( o instanceof String ) ? Double.parseDouble((String) o) : (double)o;
    return ( o instanceof Number ) ? ((Number)o).doubleValue() : d;
  }
  
  public Object get(Object o) {
    return get_(o);
  }

  protected abstract double get_(Object o);
  
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
    return foam.lib.json.DoubleParser.instance();
  }

  public foam.lib.parse.Parser queryParser() {
    return foam.lib.json.DoubleParser.instance();
  }

  public foam.lib.parse.Parser csvParser() {
    return foam.lib.json.DoubleParser.instance();
  }
  
  public boolean isDefaultValue(Object o) {
    return foam.util.SafetyUtil.compare(get_(o), 0) == 0;
  }

  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    formatter.output(get_(obj));
  }
}
