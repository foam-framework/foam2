/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.formatter;

import foam.core.ClassInfo;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.lib.PermissionedPropertyPredicate;
import foam.lib.PropertyPredicate;
import foam.lib.json.OutputJSON;
import foam.util.SafetyUtil;
import java.io.*;
import java.lang.reflect.Array;
import java.text.SimpleDateFormat;
import java.util.*;
import org.apache.commons.io.IOUtils;

/* To Make faster:

1. faster escaping
2. don't escape class names and property names
3. don't quote property keys
4. use short names
5. smaller format for enums and dates
6. have PropertyInfo output directly from primitive
7. support outputting directly to another Visitor,
   StringBuilder, OutputStream, etc. without converting
   to String.
8. Use Fast TimeStamper or similar

*/

public class JSONFObjectFormatter
  extends AbstractFObjectFormatter
{

  // TODO: use fast timestamper?
  protected static ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
      return df;
    }
  };

  protected boolean quoteKeys_           = false;
  protected boolean outputShortNames_    = true;
  protected boolean outputDefaultValues_ = false;
  protected boolean multiLineOutput_     = false;
  protected boolean outputClassNames_    = true;
  protected boolean outputReadableDates_ = true;


  public JSONFObjectFormatter(X x) {
    super(x);
  }

  public JSONFObjectFormatter() {
    super();
  }

  protected void outputUndefined() {
  }

  protected void outputNull() {
  }

  public void output(String s) {
    if ( multiLineOutput_ && s.indexOf('\n') >= 0 ) {
      b_.append("\n\"\"\"");
      escapeAppend(s);
      b_.append("\"\"\"");
    } else {
      b_.append("\"");
      escapeAppend(s);
      b_.append("\"");
    }
  }

  public void escapeAppend(String s) {
    foam.lib.json.Util.escape(s, b_);
  }

  public void output(short val) { b_.append(val); }


  public void output(int val) { b_.append(val); }


  public void output(long val) { b_.append(val); }


  public void output(float val) { b_.append(val); }


  public void output(double val) { b_.append(val); }


  public void output(boolean val) { b_.append(val); }


  protected void outputNumber(Number value) {
    b_.append(value);
  }

  protected void outputBoolean(Boolean value) {
    output(value.booleanValue());
  }

  public void output(String[] arr) {
    output((Object[]) arr);
  }

  public void output(Object[] array) {
    b_.append('[');
    for ( int i = 0 ; i < array.length ; i++ ) {
      output(array[i]);
      if ( i < array.length - 1 ) b_.append(',');
    }
    b_.append(']');
  }

  public void output(byte[][] array) {
    b_.append('[');
    for ( int i = 0 ; i < array.length ; i++ ) {
      output(array[i]);
      if ( i < array.length - 1 ) b_.append(',');
    }
    b_.append(']');
  }

  public void output(byte[] array) {
    output(foam.util.SecurityUtil.ByteArrayToHexString(array));
  }

  public void output(Map map) {
    b_.append('{');
    java.util.Iterator keys = map.keySet().iterator();
    while ( keys.hasNext() ) {
      Object key   = keys.next();
      Object value = map.get(key);
      output(key == null ? "" : key.toString());
      b_.append(':');
      output(value);
      if ( keys.hasNext() ) b_.append(',');
    }
    b_.append('}');
  }

  public void output(List list) {
    b_.append('[');
    java.util.Iterator iter = list.iterator();
    while ( iter.hasNext() ) {
      output(iter.next());
      if ( iter.hasNext() ) b_.append(",");
    }
    b_.append(']');
  }

  protected void outputProperty(FObject o, PropertyInfo p) {
    outputKey(getPropertyName(p));
    b_.append(':');
    p.format(this, o);
  }
/*
  public void outputMap(Object... values) {
    if ( values.length % 2 != 0 ) {
      throw new RuntimeException("Need even number of arguments for outputMap");
    }

    b_.append("{");
    int i = 0;
    while ( i < values.length ) {
      b_.append(beforeKey_());
      b_.append(values[i++].toString());
      b_.append(afterKey_());
      b_.append(":");
      output(values[i++]);
      if ( i < values.length ) b_.append(",");
    }
    b_.append("}");
  }
  */

  public void output(Enum<?> value) {
    output(value.ordinal());

//    outputNumber(value.ordinal());
/*
    b_.append('{');
      b_.append(beforeKey_());
      b_.append("class");
      b_.append(afterKey_());
      b_.append(':');
      output(value.getClass().getName());
      b_.append(",");
      b_.append(beforeKey_());
      b_.append("ordinal");
      b_.append(afterKey_());
      b_.append(':');
      outputNumber(value.ordinal());
    b_.append('}');
    */
  }

  public void output(Object value) {
    if ( value instanceof OutputJSON ) {
      ((OutputJSON) value).formatJSON(this);
    } else if ( value instanceof String ) {
      output((String) value);
    } else if ( value instanceof FObject ) {
      output((FObject) value);
    } else if ( value instanceof PropertyInfo) {
      output((PropertyInfo) value);
    } else if ( value instanceof ClassInfo ) {
      output((ClassInfo) value);
    } else if ( value instanceof Number ) {
      outputNumber((Number) value);
    } else if ( isArray(value) ) {
      if ( value.getClass().equals(byte[][].class) ) {
        output((byte[][]) value);
      } else if ( value instanceof byte[] ) {
        output((byte[]) value);
      } else {
        output((Object[]) value);
      }
    } else if ( value instanceof Boolean ) {
      outputBoolean((Boolean) value);
    } else if ( value instanceof Date ) {
      output((Date) value);
    } else if ( value instanceof Map ) {
      output((Map) value);
    } else if ( value instanceof List ) {
      output((List) value);
    } else if ( value instanceof Enum<?> ) {
      output((Enum<?>) value);
    } else /*if ( value == null )*/ {
      b_.append("null");
    }
  }

  protected boolean isArray(Object value) {
    return value != null &&
      ( value.getClass() != null ) &&
      value.getClass().isArray();
  }

  public void outputDateValue(Date date) {
    if ( outputReadableDates_ )
      output(sdf.get().format(date));
    else
      outputNumber(date.getTime());
  }

  public void output(Date date) {
    output(date.getTime());
    /*
    b_.append("{\"class\":\"__Timestamp__\",\"value\":");
    outputDateValue(date);
    b_.append('}');
    */
  }

  protected Boolean maybeOutputProperty(FObject fo, PropertyInfo prop, boolean includeComma) {

    if ( ! outputDefaultValues_ && ! prop.isSet(fo) ) return false;

    Object value = prop.get(fo);
    if ( value == null || ( isArray(value) && Array.getLength(value) == 0 ) ) {
      return false;
    }

    if ( includeComma ) b_.append(',');
    if ( multiLineOutput_ ) addInnerNewline();
    outputProperty(fo, prop);
    return true;
  }

  public void outputDelta(FObject oldFObject, FObject newFObject) {
    ClassInfo info           = oldFObject.getClassInfo();
    ClassInfo newInfo        = newFObject.getClassInfo();
    boolean   outputComma    = true;
    boolean   isDiff         = false;
    boolean   isPropertyDiff = false;

    if ( ! oldFObject.equals(newFObject) ) {
      List     axioms = getProperties(info);
      Iterator i      = axioms.iterator();

      b_.append('{');
      addInnerNewline();
      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        isPropertyDiff = maybeOutputPropertyDelta(oldFObject, newFObject, prop);
        if ( isPropertyDiff) {
          if ( ! isDiff ) {
            if ( outputClassNames_ ) {
              //output Class name
              outputKey("class");
              b_.append(":");
              output(newInfo.getId());
            }
            if ( outputClassNames_ ) b_.append(",");
            addInnerNewline();
            PropertyInfo id = (PropertyInfo) newInfo.getAxiomByName("id");
            outputProperty(newFObject, id);
            isDiff = true;
          }
          b_.append(",");
          addInnerNewline();
          outputProperty(newFObject, prop);
        }
      }

      if ( isDiff ) {
        addInnerNewline();
        b_.append('}');
      }
    }
  }

  protected void addInnerNewline() {
    if ( multiLineOutput_ ) {
      b_.append('\n');
    }
  }

  protected boolean maybeOutputPropertyDelta(FObject oldFObject, FObject newFObject, PropertyInfo prop) {
    return prop.compare(oldFObject, newFObject) != 0;
  }

/*
  public void outputJSONJFObject(FObject o) {
    b_.append("p(");
    outputFObject(o);
    b_.append(")\r\n");
  }
  */

  public void output(FObject[] arr, ClassInfo defaultClass) {
    output(arr);
  }

  public void output(FObject[] arr) {
  }

  public void output(FObject o, ClassInfo defaultClass) {
    output(o);
  }

  public void output(FObject o) {
    ClassInfo info = o.getClassInfo();

    b_.append('{');
    addInnerNewline();
    if ( outputClassNames_ ) {
      outputKey("class");
      b_.append(':');
      output(info.getId());
    }

    List     axioms      = getProperties(info);
    Iterator i           = axioms.iterator();
    boolean  outputComma = outputClassNames_;
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      outputComma = maybeOutputProperty(o, prop, outputComma) || outputComma;
    }
    addInnerNewline();
    b_.append('}');
  }

  public void output(PropertyInfo prop) {
    b_.append('{');
    outputKey("class");
    b_.append(':');
    output("__Property__");
    b_.append(",");
    outputKey("forClass_");
    b_.append(':');
    output(prop.getClassInfo().getId());
    b_.append(',');
    outputKey("name");
    b_.append(':');
    output(getPropertyName(prop));
//    if ( quoteKeys_ ) {
//      output(getPropertyName(prop));
//    } else {
//      outputRawString(getPropertyName(prop));
//    }
    b_.append('}');
  }

  public void outputJson(String str) {
    if ( ! quoteKeys_ )
      str = str.replaceAll("\"class\"", "class");
    outputFormattedString(str);
  }

  public void output(ClassInfo info) {
    outputKey(info.getId());
//    b_.append('{');
//    if ( quoteKeys_ ) b_.append(beforeKey_());
//    b_.append("class");
//    if ( quoteKeys_ ) b_.append(afterKey_());
//    b_.append(":");
//    b_.append("\"__Class__\"");
//    b_.append(":");
//    b_.append("{\"class\":\"__Class__\",\"forClass_\":");
//    output(info.getId());
//    b_.append('}');
  }

  protected void appendQuote() {
    b_.append("\"");
  }
  public String getPropertyName(PropertyInfo p) {
    return outputShortNames_ && ! SafetyUtil.isEmpty(p.getShortName()) ? p.getShortName() : p.getName();
  }

  public void outputFormattedString(String str) {
    b_.append(str);
  }

  public JSONFObjectFormatter setQuoteKeys(boolean quoteKeys) {
    quoteKeys_ = quoteKeys;
    return this;
  }

  public JSONFObjectFormatter setOutputShortNames(boolean outputShortNames) {
    outputShortNames_ = outputShortNames;
    return this;
  }

  public JSONFObjectFormatter setOutputDefaultValues(boolean outputDefaultValues) {
    outputDefaultValues_ = outputDefaultValues;
    return this;
  }

  public JSONFObjectFormatter setOutputClassNames(boolean outputClassNames) {
    outputClassNames_ = outputClassNames;
    return this;
  }

  public JSONFObjectFormatter setMultiLine(boolean ml) {
    multiLineOutput_ = ml;
    return this;
  }

  protected void outputKey(String val) {
    if ( quoteKeys_ ) appendQuote();
    b_.append(val);
    if ( quoteKeys_ ) appendQuote();
  }
}
