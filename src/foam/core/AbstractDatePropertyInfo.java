package foam.core;

import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZoneId;
import java.util.Date;

public abstract class AbstractDatePropertyInfo
  extends AbstractPropertyInfo
{

  public int compareValues(java.util.Date o1, java.util.Date o2) {
    return o1.compareTo(o2);
  }

  public void setFromString(Object obj, String value) {
    Date date = new Date(value);
    this.set(obj, date);
  }
}
