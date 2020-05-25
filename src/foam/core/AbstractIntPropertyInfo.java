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

public abstract class AbstractIntPropertyInfo
    extends AbstractPropertyInfo
{
  protected static final ThreadLocal<ByteBuffer> bb = new ThreadLocal<ByteBuffer>() {
    @Override
    protected ByteBuffer initialValue() {
      return ByteBuffer.wrap(new byte[4]);
    }

    @Override
    public ByteBuffer get() {
      ByteBuffer bb = super.get();
      bb.clear();
      return bb;
    }
  };

  public int compareValues(int o1, int o2) {
    return Integer.compare(o1, o2);
  }

  public Object fromString(String value) {
    return Integer.valueOf(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return Integer.valueOf(reader.getText());
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    int val = (int) get(obj);
    md.update((ByteBuffer) bb.get().putInt(val).flip());
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    int val = (int) get(obj);
    sig.update((ByteBuffer) bb.get().putInt(val).flip());
  }
  
  public String getSQLType() {
    return "INT";
  }
  
  public Class getValueClass() {
    return int.class;
  }
  
  public int cast(Object o) {
    int i = ( o instanceof String ) ? Integer.valueOf((String) o) : (int) o;
    return ( o instanceof Number ) ? ((Number) o).intValue() : i;
  }
  
  public Object get(Object o) {
    return get_(o);
  }

  protected abstract int get_(Object o);
  
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
    return foam.lib.json.IntParser.instance();
  }

  public foam.lib.parse.Parser queryParser() {
    return foam.lib.json.IntParser.instance();
  }

  public foam.lib.parse.Parser csvParser() {
    return foam.lib.json.IntParser.instance();
  }
  
  public boolean isDefaultValue(Object o) {
    return foam.util.SafetyUtil.compare(get_(o), 0) == 0;
  }

  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    formatter.output(get_(obj));
  }
}
