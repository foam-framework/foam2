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
    return s.replace("\n","\\n").replace("\"", "\\\"");
  }

  protected void outputNumber(StringBuilder out, Number value) {
    out.append(value.toString());
  }

  protected void outputFloat(StringBuilder out) {
  }

  protected void outputDouble(StringBuilder out) {
  }

  protected void outputBoolean(StringBuilder out, Boolean value) {
    if ( value ) out.append("true");
    else out.append("false");
  }

  protected void outputArray(StringBuilder out, Object[] array) {
    out.append("[");
    for ( int i = 0 ; i < array.length ; i++ ) {
      output(out, array[i]);
      if ( i < array.length - 1 ) out.append(",");
    }
    out.append("]");
  }

  protected void outputMap(StringBuilder out, java.util.Map map) {
    out.append("{");
    java.util.Iterator keys = map.keySet().iterator();
    while ( keys.hasNext() ) {
      Object key = keys.next();
      Object value = map.get(key);
      outputString(out, key.toString());
      out.append(":");
      output(out, value);
      if ( keys.hasNext() ) out.append(",");
    }
  }

  protected void outputProperty(StringBuilder out, FObject o, PropertyInfo p) {
    out.append(beforeKey_());
    out.append(p.getName());
    out.append(afterKey_());
    out.append(":");
    p.toJSON(this, out, p.get(o));
  }

  public void output(StringBuilder out, Object value) {
    if ( value instanceof OutputJSON ) {
      ((OutputJSON)value).outputJSON(out, this);
    } else if ( value instanceof String ) {
      outputString(out, (String)value);
    } else if ( value instanceof FObject ) {
      outputFObject(out, (FObject)value);
    } else if ( value instanceof Number ) {
      outputNumber(out, (Number)value);
    } else if ( value.getClass().isArray() ) {
      outputArray(out, (Object[])value);
    } else if ( value instanceof Boolean ) {
      outputBoolean(out, (Boolean)value);
    } else if ( value instanceof java.util.Date ) {
      outputDate(out, (java.util.Date)value);
    } else if ( value instanceof java.util.Map ) {
      outputMap(out, (java.util.Map)value);
    }
  }

  protected void outputDate(StringBuilder out, java.util.Date date) {
    java.text.DateFormat formatter = new java.text.SimpleDateFormat("YYYY-MM-dd'T'kk:hh:ss.S'Z'");
    formatter.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
    outputString(out, formatter.format(date));
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

    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo)i.next();
      if ( prop.getTransient() ) continue;

      Object value = prop.get(o);
      if ( value == null ) continue;

      out.append(",");
      outputProperty(out, o, prop);
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
