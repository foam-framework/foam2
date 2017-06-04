package foam.core;

import foam.lib.parse.Parser;

public abstract class AbstractPropertyInfo
  implements PropertyInfo
{
  protected ClassInfo parent;

  @Override
  public PropertyInfo setClassInfo(ClassInfo p) {
    parent = p;
    return this;
  }

  @Override
  public ClassInfo getClassInfo() {
    return parent;
  }

  @Override
  public void toJSON(foam.lib.json.Outputter outputter, StringBuilder out, Object value) {
    outputter.output(out, value);
  }

  @Override
  public foam.mlang.Expr partialEval() {
    return this;
  }

  @Override
  public Object f(FObject o) {
    return get(o);
  }
}
