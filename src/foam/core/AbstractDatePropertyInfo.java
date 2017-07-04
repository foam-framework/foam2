/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;
import java.util.Date;

public abstract class AbstractDatePropertyInfo
        extends AbstractPropertyInfo
{

  public int compareValues(java.util.Date o1, java.util.Date o2) {
    return o1.compareTo(o2);
  }

  public void setFromString(Object obj, String value) {
//    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(getDateFormat()).withZone(ZoneOffset.UTC);
//    LocalDateTime date = LocalDateTime.parse(value, formatter);
//    this.set(obj, Date.from(date.atZone(ZoneId.of("UTC")).toInstant()));
    Date date = new Date(value);
    this.set(obj, date);
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    Date date = new Date(reader.getText());
    return date;
  }
}