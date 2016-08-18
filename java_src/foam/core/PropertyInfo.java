package foam.core;

import foam.lib.parse.Parser;

public interface PropertyInfo extends foam.mlang.Expr {
  public PropertyInfo setClassInfo(ClassInfo p);
  public ClassInfo getClassInfo();

  public String getName();
  public Object get(Object obj);
  public void set(Object obj, Object value);
  public Parser jsonParser();
  public void toJSON(foam.lib.json.Outputter outputter, StringBuilder out, Object value);
}
