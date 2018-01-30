/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;
import java.security.MessageDigest;
import java.util.Date;

public abstract class AbstractDatePropertyInfo
  extends AbstractPropertyInfo
{

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
  public void hash(FObject obj, MessageDigest md) {
    Date date = (Date) get(obj);
    if ( date == null ) {
      return;
    }

    super.hash(obj, md);
    long val = date.getTime();
    md.update(new byte[] {
        (byte)((val & 0xFF00000000000000L) >> 56),
        (byte)((val & 0x00FF000000000000L) >> 48),
        (byte)((val & 0x0000FF0000000000L) >> 40),
        (byte)((val & 0x000000FF00000000L) >> 32),
        (byte)((val & 0x00000000FF000000L) >> 24),
        (byte)((val & 0x0000000000FF0000L) >> 16),
        (byte)((val & 0x000000000000FF00L) >> 8),
        (byte)((val & 0x00000000000000FFL))
    });
  }
}
