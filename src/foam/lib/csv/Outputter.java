/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.core.FObject;

import java.util.Date;

public class Outputter {

  public String stringify(FObject obj) {
    StringBuilder sb = new StringBuilder();
    outputFObject(sb, obj);
    return sb.toString();
  }

  public String escape(String s) {
    return s.replace("\n","\\n").replace("\"", "\\\"");
  }

  protected void outputString(StringBuilder out, String s) {
    out.append(escape(s));
  }

  protected void outputNumber(StringBuilder out, Number value) {
    out.append(value.toString());
  }

  protected void outputBoolean(StringBuilder out, Boolean value) {
    out.append(value ? "true" : "false");
  }

  protected void outputDate(StringBuilder out, Date value) {

  }

  protected void outputFObject(StringBuilder out, FObject o) {

  }

  public void output( StringBuilder out, Object value ) {
    if ( value instanceof String ) {
      outputString(out, (String) value);
    } else if ( value instanceof Number ) {
      outputNumber(out, (Number) value);
    } else if ( value instanceof Boolean ) {
      outputBoolean(out, (Boolean) value);
    } else if ( value instanceof Date ) {
      outputDate(out, (Date) value);
    }
  }
}