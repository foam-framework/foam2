/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.core.FEnum;
import foam.nanos.logger.Logger;
import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.security.Signature;
import java.security.SignatureException;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

public abstract class AbstractEnumPropertyInfo
  extends AbstractObjectPropertyInfo
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

  public abstract int            getOrdinal(Object o);
  public abstract java.lang.Enum forOrdinal(int ordinal);
  public abstract void           toJSON(foam.lib.json.Outputter outputter, Object value);

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    FObject obj = null;
    try {

      while ( reader.hasNext() ) {
        switch ( reader.getEventType() ) {
          case XMLStreamConstants.START_ELEMENT:
            // Enum Specific Case
            if ( reader.getLocalName().equals(this.getName()) ) {
              // Move to characters within tags to extract ordinal value
              reader.next();
              Integer ordinalVal = Integer.parseInt(reader.getText());
              // Searches forOrdinal in relation to the specific ENUM that's created
              return this.forOrdinal(ordinalVal);
            }
          case XMLStreamConstants.END_ELEMENT:
            break;
        }
        reader.next();
      }
    } catch (XMLStreamException ex) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Premature end of xml file while reading property", this.getName());
    }
    return obj;
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    int val = getOrdinal(get(obj));
    md.update((ByteBuffer) bb.get().putInt(val).flip());
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    int val = getOrdinal(get(obj));
    sig.update((ByteBuffer) bb.get().putInt(val).flip());
  }

  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    formatter.outputEnum((FEnum) get_(obj));
  }
}
