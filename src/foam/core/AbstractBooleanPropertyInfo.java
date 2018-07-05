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
}
