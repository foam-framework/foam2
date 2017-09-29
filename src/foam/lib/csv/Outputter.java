/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.lib.json.OutputterMode;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.TimeZone;
import java.util.stream.Collectors;

public class Outputter {

  protected ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat df = new SimpleDateFormat("YYYY-MM-dd'T'HH:mm:ss.S'Z'");
      df.setTimeZone(TimeZone.getTimeZone("UTC"));
      return df;
    }
  };

  protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  public final OutputterMode mode;

  public Outputter() {
    this(OutputterMode.FULL);
  }

  public Outputter(OutputterMode mode) {
    this.mode = mode;
  }

  public String stringify(FObject obj) {
    StringBuilder builder = sb.get();
    outputFObject(builder, obj);
    return builder.toString();
  }

  public String escape(String s) {
    return s.replace("\n","\\n").replace("\"", "\\\"");
  }

  protected void outputString(StringBuilder out, String s) {
    if ( s == null || s.isEmpty() ) return;
    out.append(escape(s));
  }

  protected void outputNumber(StringBuilder out, Number value) {
    out.append(value.toString());
  }

  protected void outputBoolean(StringBuilder out, Boolean value) {
    out.append(value ? "true" : "false");
  }

  protected void outputDate(StringBuilder out, Date value) {
    outputString(out, sdf.get().format(value));
  }

  protected void outputFObject(StringBuilder out, FObject obj) {
    // get a list of filtered properties, filtering out network & storage transient properties
    // also filter out null values and empty strings
    List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    props = props.stream().filter(prop -> {
      if ( mode == OutputterMode.NETWORK && prop.getNetworkTransient() )
        return false;
      if ( mode == OutputterMode.STORAGE && prop.getStorageTransient() )
        return false;

      Object value = prop.f(obj);
      return value != null && (!(value instanceof String) || !((String) value).isEmpty());
    })
        .collect(Collectors.toList());

    Iterator i = props.iterator();

    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      if ( mode == OutputterMode.NETWORK && prop.getNetworkTransient() ) continue;
      if ( mode == OutputterMode.STORAGE && prop.getStorageTransient() ) continue;

      Object value = prop.f(obj);
      if ( value == null || ( value instanceof String && ((String) value).isEmpty()) )
        continue;
      prop.toCSV(this, out, value);
      if ( i.hasNext() ) {
        out.append(",");
      }
    }
    out.append("\n");
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