/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.StringPStream;

import javax.xml.stream.XMLStreamReader;
import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.security.Signature;
import java.security.SignatureException;
import java.util.Date;

public abstract class AbstractDatePropertyInfo
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

  public int compareValues(java.lang.Object o1, java.lang.Object o2) {
    return ((Date)o1).compareTo(((Date)o2));
  }

  public Object fromString(String value) {
    StringPStream ps = new StringPStream(value);
    ParserContextImpl x = new ParserContextImpl();
    ps = (StringPStream) jsonParser().parse(ps, x);
    return ps == null ? null : ps.value();
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return fromString(reader.getText());
  }

  @Override
  public void cloneProperty(FObject source, FObject dest) {
    Object value = get(source);

    set(dest, value == null ? null : new Date(((Date) value).getTime()));
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    Date date = (Date) get(obj);
    if ( date == null ) return;

    long val = date.getTime();
    md.update((ByteBuffer) bb.get().putLong(val).flip());
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    Date date = (Date) get(obj);
    if ( date == null ) return;

    long val = date.getTime();
    sig.update((ByteBuffer) bb.get().putLong(val).flip());
  }
}
