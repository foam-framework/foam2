/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.dao.pg.IndexedPreparedStatement;
import javax.xml.stream.XMLStreamReader;
import java.util.Date;

public abstract class AbstractDatePropertyInfo
  extends AbstractPropertyInfo
{

  public int compareValues(java.lang.Object o1, java.lang.Object o2) {
    return ((Date)o1).compareTo(((Date)o2));
  }

  public Object fromString(String value) {
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
}
