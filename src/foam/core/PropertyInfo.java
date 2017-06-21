/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.lib.parse.Parser;
import java.util.Comparator;
import java.util.Map;

// ???: Why is this interface mutable?
public interface PropertyInfo
  extends foam.mlang.Expr, Comparator
{
  public PropertyInfo setClassInfo(ClassInfo p);
  public ClassInfo getClassInfo();

  public boolean getTransient();
  public boolean getRequired();
  public String getName();
  public Object get(Object obj);
  public void set(Object obj, Object value);
  public Parser jsonParser();
  public void toJSON(foam.lib.json.Outputter outputter, StringBuilder out, Object value);
  public void diff(FObject o1, FObject o2, Map diff, PropertyInfo prop);
}
