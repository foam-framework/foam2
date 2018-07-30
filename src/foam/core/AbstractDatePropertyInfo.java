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
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

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

  protected static final ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.S'Z'");
      df.setTimeZone(TimeZone.getTimeZone("UTC"));
      return df;
    }
  };

  public int compareValues(java.lang.Object o1, java.lang.Object o2) {
    return ((Date)o1).compareTo(((Date)o2));
  }

  public Object fromString(String value) {
    //  DateTimeFormatter formatter = DateTimeFormatter.ofPattern(getDateFormat()).withZone(ZoneOffset.UTC);		 +    return new Date(value);
    //  LocalDateTime date = LocalDateTime.parse(value, formatter);
    //  this.set(obj, Date.from(date.atZone(ZoneId.of("UTC")).toInstant()));
    return new Date(value);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    Date date = new Date(reader.getText());
    return date;
  }

  @Override
  public void cloneProperty(FObject source, FObject dest) {
    Object value = get(source);

    set(dest, value == null ? null : new Date(((Date)value).getTime()));
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
