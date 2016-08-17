package foam.core;

import foam.lib.parse.Parser;

public interface PropertyInfo extends foam.mlang.Expr {
  public String getName();
  public Object get(Object obj);
  public void set(Object obj, Object value);
  public Parser jsonParser();
}
