package foam.core;

public abstract class AbstractLongPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(long o1, long o2) {
    return java.lang.Long.compare(o1, o2);
  }

  public foam.lib.parse.Parser jsonParser() {
    return new foam.lib.json.LongParser();
  
  public void setFromString(Object obj, String value) {
    this.set(obj, Long.valueOf(value));
  }
}
