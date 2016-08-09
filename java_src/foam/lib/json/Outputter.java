package foam.lib.json;

import foam.core.FObject;
import foam.core.ClassInfo;
import foam.core.PropertyInfo;

import java.util.List;
import java.util.Iterator;

public class Outputter {
  public String stringify(FObject obj) {
    StringBuilder sb = new StringBuilder();
    outputFObject(sb, obj);
    return sb.toString();
  }

  protected void outputUndefined(StringBuilder out) {
  }

  protected void outputNull(StringBuilder out) {
  }

  protected void outputString(StringBuilder out, String s) {
    out.append("\"");
    out.append(escape(s));
    out.append("\"");
  }

  public String escape(String s) {
    return s.replace("\"", "\\\"");
  }

  protected void outputNumber(StringBuilder out, Number value) {
    out.append(value.toString());
  }

  protected void outputFloat(StringBuilder out) {
  }

  protected void outputDouble(StringBuilder out) {
  }

  protected void outputBoolean(StringBuilder out) {
  }

  protected void outputDate(StringBuilder out) {
  }

  protected void outputProperty(StringBuilder out, FObject o, PropertyInfo p, boolean comma) {
    out.append(beforeKey_());
    out.append(p.getName());
    out.append(afterKey_());
    out.append(":");
    output(out, p.get(o));
    if ( comma ) {
      out.append(",");
    }
  }

  protected void output(StringBuilder out, Object value) {
    if ( value instanceof String ) {
      outputString(out, (String)value);
    } else if ( value instanceof FObject ) {
      outputFObject(out, (FObject)value);
    } else if ( value instanceof Number ) {
      outputNumber(out, (Number)value);
    }
  }

  protected void outputFObject(StringBuilder out, FObject o) {
    ClassInfo info = o.getClassInfo();
    out.append("{");
    out.append(beforeKey_());
    out.append("class");
    out.append(afterKey_());
    out.append(":");

    outputString(out, info.getId());

    List axioms = info.getAxiomsByClass(PropertyInfo.class);
    Iterator i = axioms.iterator();

    boolean first = true;
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo)i.next();
      Object value = prop.get(o);
      if ( value == null ) continue;

      if ( first ) {
        out.append(",");
        first = false;
      }
      outputProperty(out, o, prop, i.hasNext());
    }

    out.append("}");
  }

  protected String beforeKey_() {
    return "\"";
  }

  protected String afterKey_() {
    return "\"";
  }

  protected void outputObject(Object o) {
  }

  public FObject parse(String str) {
    return null;
  }
}
