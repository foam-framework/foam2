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
    double val = (double) get(obj);
    md.update(bb.get().putDouble(val));
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    double val = (double) get(obj);
    sig.update(bb.get().putDouble(val));
  }
}
