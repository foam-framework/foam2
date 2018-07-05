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
}
