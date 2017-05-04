package foam.core;

import foam.lib.parse.Parser;
import java.util.Comparator;

public interface PropertyInfo
  extends foam.mlang.Expr, Comparator
{
  public PropertyInfo setClassInfo(ClassInfo p);
  public ClassInfo getClassInfo();

  public boolean getTransient();
  public String getName();
  public Object get(Object obj);
  public void set(Object obj, Object value);
  public Parser jsonParser();
  public void toJSON(foam.lib.json.Outputter outputter, StringBuilder out, Object value);
}
