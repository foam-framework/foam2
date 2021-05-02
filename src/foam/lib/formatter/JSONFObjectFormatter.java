/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.formatter;

import foam.core.*;
import foam.lib.json.OutputJSON;
import foam.util.SafetyUtil;
import java.lang.reflect.Array;
import java.text.SimpleDateFormat;
import java.util.*;

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

/* Example use:
  protected static final ThreadLocal<foam.lib.formatter.FObjectFormatter> formatter_ = new ThreadLocal<foam.lib.formatter.FObjectFormatter>() {
        @Override
        protected foam.lib.formatter.JSONFObjectFormatter initialValue() {
          foam.lib.formatter.JSONFObjectFormatter formatter = new foam.lib.formatter.JSONFObjectFormatter();
          formatter.setQuoteKeys(true);
          formatter.setPropertyPredicate(new foam.lib.AndPropertyPredicate(new foam.lib.PropertyPredicate[] {new foam.lib.NetworkPropertyPredicate(), new foam.lib.PermissionedPropertyPredicate()}));
          return formatter;
        }

       @Override
       public FObjectFormatter get() {
         FObjectFormatter formatter = super.get();
         formatter.setX(getX());
         formatter.reset();
         return formatter;
       }
    };
  ...
  foam.lib.formatter.FObjectFormatter formatter = formatter_.get();
  formatter.output(fObj);
  writer.append(formatter.builder());
*/

public class JSONFObjectFormatter
  extends AbstractFObjectFormatter
{

  protected static ThreadLocal<foam.util.FastTimestamper> timestamper_ = new ThreadLocal<foam.util.FastTimestamper>() {
    @Override
    protected foam.util.FastTimestamper initialValue() {
      foam.util.FastTimestamper ft = new foam.util.FastTimestamper();
      return ft;
    }
  };

  protected boolean quoteKeys_               = false;
  protected boolean outputShortNames_        = false;
  protected boolean outputDefaultValues_     = false;
  protected boolean multiLineOutput_         = false;
  protected boolean outputClassNames_        = true;
  protected boolean outputReadableDates_     = false;
  protected boolean outputDefaultClassNames_ = true;
  protected boolean calculateDeltaForNestedFObjects_ = true;

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
      append("\n\"\"\"");
      escapeAppend(s);
      append("\"\"\"");
    } else {
      append('"');
      escapeAppend(s);
      append('"');
    }
  }

  public void escapeAppend(String s) {
    if ( s == null ) return;
    StringBuilder sb = new StringBuilder();
    foam.lib.json.Util.escape(s, sb);
    append(sb.toString());
  }

  public void output(short val) { append(val); }


  public void output(int val) { append(val); }


  public void output(long val) { append(val); }


  public void output(float val) { append(val); }


  public void output(double val) { append(val); }


  public void output(boolean val) { append(val); }


  protected void outputNumber(Number value) {
    append(value);
  }

  public void output(String[] arr) {
    output((Object[]) arr);
  }

  public void output(Object[] array) {
    append('[');
    for ( int i = 0 ; i < array.length ; i++ ) {
      output(array[i]);
      if ( i < array.length - 1 ) append(',');
    }
    append(']');
  }

  public void output(byte[][] array) {
    append('[');
    for ( int i = 0 ; i < array.length ; i++ ) {
      output(array[i]);
      if ( i < array.length - 1 ) append(',');
    }
    append(']');
  }

  public void output(byte[] array) {
    output(foam.util.SecurityUtil.ByteArrayToHexString(array));
  }

  public void output(Map map) {
    append('{');
    java.util.Iterator keys = map.keySet().iterator();
    while ( keys.hasNext() ) {
      Object key   = keys.next();
      Object value = map.get(key);
      output(key == null ? "" : key.toString());
      append(':');
      output(value);
      if ( keys.hasNext() ) append(',');
    }
    append('}');
  }

  public void output(List list) {
    append('[');
    java.util.Iterator iter = list.iterator();
    while ( iter.hasNext() ) {
      output(iter.next());
      if ( iter.hasNext() ) append(',');
    }
    append(']');
  }

  protected void outputProperty(FObject o, PropertyInfo p) {
    outputKey(getPropertyName(p));
    append(':');
    p.formatJSON(this, o);
  }

  protected boolean maybeOutPutFObjectProperty(FObject newFObject, FObject oldFObject, PropertyInfo prop) {
    if ( prop instanceof AbstractFObjectPropertyInfo && oldFObject != null &&
      prop.get(oldFObject) != null && prop.get(newFObject) != null
    ) {
      String before = builder().toString();
      reset();
      if ( maybeOutputDelta(((FObject)prop.get(oldFObject)), ((FObject)prop.get(newFObject))) ) {
        String after = builder().toString();
        reset();
        append(before);
        outputKey(getPropertyName(prop));
        append(':');
        append(after);
        return true;
      }
      append(before);
      return false;
    }
    outputProperty(newFObject, prop);
    return true;
  }
/*
  public void outputMap(Object... values) {
    if ( values.length % 2 != 0 ) {
      throw new RuntimeException("Need even number of arguments for outputMap");
    }

    append("{");
    int i = 0;
    while ( i < values.length ) {
      append(beforeKey_());
      append(values[i++].toString());
      append(afterKey_());
      append(":");
      output(values[i++]);
      if ( i < values.length ) append(",");
    }
    append("}");
  }
  */


  public void outputEnumValue(FEnum value) {
    append('{');
    outputKey("class");
    append(':');
    output(value.getClass().getName());
    append(',');
    outputKey("ordinal");
    append(':');
    outputNumber(value.getOrdinal());
    append('}');
  }

  public void outputEnum(FEnum value) {
    output(value.getOrdinal());
  }

  public void output(Object value) {
    if ( value == null ) {
      append("null");
    } else if ( value instanceof OutputJSON ) {
      ((OutputJSON) value).formatJSON(this);
    } else if ( value instanceof String ) {
      output((String) value);
    } else if ( value instanceof FEnum ) {
      outputEnumValue((FEnum) value);
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
      output(((Boolean) value).booleanValue());
    } else if ( value instanceof Date ) {
      outputDateValue((Date) value);
    } else if ( value instanceof Map ) {
      output((Map) value);
    } else if ( value instanceof List ) {
      output((List) value);
    } else {
      System.err.println(this.getClass().getSimpleName()+".output, Unexpected value type: "+value.getClass().getName());
      append("null");
    }
  }

  protected boolean isArray(Object value) {
    return value != null &&
      ( value.getClass() != null ) &&
      value.getClass().isArray();
  }

  /** Called when outputting a Date from an Object field so that the type is know. **/
  public void outputDateValue(Date date) {
    append("{\"class\":\"__Timestamp__\",\"value\":");
    if ( outputReadableDates_ ) {
      outputReadableDate(date);
    } else {
      outputNumber(date.getTime());
    }
    append('}');
  }

  public void output(Date date) {
    if ( date != null ) {
      output(date.getTime());
    } else {
      append("null");
    }
  }

  public void outputReadableDate(Date date) {
    if ( date != null ) {
      output(timestamper_.get().createTimestamp(date.getTime()));
    } else {
      output("null");
    }
  }

  protected boolean maybeOutputProperty(FObject fo, PropertyInfo prop, boolean includeComma) {
    if ( ! outputDefaultValues_ && ! prop.isSet(fo) ) return false;

    Object value = prop.get(fo);
    if ( value == null ||
         ( isArray(value) && Array.getLength(value) == 0 ) ||
         ( value instanceof FObject && value.equals(fo) ) ) {
      return false;
    }

    if ( includeComma ) append(',');
    if ( multiLineOutput_ ) addInnerNewline();
    outputProperty(fo, prop);
    return true;
  }

  public boolean maybeOutputDelta(FObject oldFObject, FObject newFObject) {
    return maybeOutputDelta(oldFObject, newFObject, null);
  }

  public boolean maybeOutputDelta(FObject oldFObject, FObject newFObject, ClassInfo defaultClass) {
    ClassInfo newInfo   = newFObject.getClassInfo();
    String    of        = newInfo.getObjClass().getSimpleName().toLowerCase();
    List      axioms    = getProperties(newInfo);
    int       size      = axioms.size();
    int       delta     = 0;
    int       ids       = 0;
    int       optional  = 0;

    String before = builder().toString();
    reset();
    for ( int i = 0 ; i < size ; i++ ) {
      PropertyInfo prop = (PropertyInfo) axioms.get(i);
      if ( prop.includeInID() || prop.compare(oldFObject, newFObject) != 0 ) {
        if ( delta > 0 ) {
          append(',');
          addInnerNewline();
        }
        if ( calculateDeltaForNestedFObjects_ ) {
          if (maybeOutPutFObjectProperty(newFObject, oldFObject, prop)) delta += 1;
        } else {
          outputProperty(newFObject, prop);
          delta += 1;
        }


        if ( prop.includeInID() ) {
          ids += 1;
        } else if ( optionalPredicate_.propertyPredicateCheck(getX(), of, prop) ) {
          optional += 1;
        }
      }
    }
    String output = builder().toString();
    reset();

    if ( delta > 0 && delta > ids + optional ) {
      boolean outputClass = outputClassNames_ && ( newInfo != defaultClass || outputDefaultClassNames_ );

      append(before);
      append('{');
      addInnerNewline();
      if ( outputClass ) {
        //output Class name
        outputKey("class");
        append(':');
        output(newInfo.getId());
        append(',');
        addInnerNewline();
      }
      append(output);
      addInnerNewline();
      append('}');

      return true;
    }

    // Return false when either no delta or the delta are from ids and storage
    // optional properties
    return false;
  }

  protected void addInnerNewline() {
    if ( multiLineOutput_ ) {
      append('\n');
    }
  }

/*
  public void outputJSONJFObject(FObject o) {
    append("p(");
    outputFObject(o);
    append(")\r\n");
  }
  */

  public void output(FObject[] arr, ClassInfo defaultClass) {
    output(arr);
  }

  public void output(FObject[] arr) {

    append('[');
    for ( int i = 0 ; i < arr.length ; i++ ) {
      output(arr[i]);
      if ( i < arr.length - 1 ) append(',');
    }
    append(']');

  }

  public void output(FObject o, ClassInfo defaultClass) {
    ClassInfo info = o.getClassInfo();

    boolean outputClass = outputClassNames_ && ( info != defaultClass || outputDefaultClassNames_ );

    append('{');
    addInnerNewline();
    if ( outputClass ) {
      outputKey("class");
      append(':');
      output(info.getId());
    }
    boolean outputComma = outputClass;

    List axioms = getProperties(info);
    int  size   = axioms.size();
    for ( int i = 0 ; i < size ; i++ ) {
      PropertyInfo prop = (PropertyInfo) axioms.get(i);
      outputComma = maybeOutputProperty(o, prop, outputComma) || outputComma;
    }
    addInnerNewline();
    append('}');
  }

  public void output(FObject o) {
    output(o, null);
  }

  public void output(PropertyInfo prop) {
    append('{');
    outputKey("class");
    append(':');
    output("__Property__");
    append(',');
    outputKey("forClass_");
    append(':');
    output(prop.getClassInfo().getId());
    append(',');
    outputKey("name");
    append(':');
    output(getPropertyName(prop));
//    if ( quoteKeys_ ) {
//      output(getPropertyName(prop));
//    } else {
//      outputRawString(getPropertyName(prop));
//    }
    append('}');
  }

  public void outputJson(String str) {
    if ( ! quoteKeys_ )
      str = str.replaceAll("\"class\"", "class");
    outputFormattedString(str);
  }

  public void output(ClassInfo info) {
    output(info.getId());
//    append('{');
//    if ( quoteKeys_ ) append(beforeKey_());
//    append("class");
//    if ( quoteKeys_ ) append(afterKey_());
//    append(":");
//    append("\"__Class__\"");
//    append(":");
//    append("{\"class\":\"__Class__\",\"forClass_\":");
//    output(info.getId());
//    append('}');
  }

  protected void appendQuote() {
    append('"');
  }

  public String getPropertyName(PropertyInfo p) {
    return outputShortNames_ && ! SafetyUtil.isEmpty(p.getShortName()) ? p.getShortName() : p.getName();
  }

  public void outputFormattedString(String str) {
    append(str);
  }

  public JSONFObjectFormatter setQuoteKeys(boolean quoteKeys) {
    quoteKeys_ = quoteKeys;
    return this;
  }

  public JSONFObjectFormatter setCalculateNestedDelta(boolean calculateNestedDelta) {
    calculateDeltaForNestedFObjects_ = calculateNestedDelta;
    return this;
  }

  public JSONFObjectFormatter setOutputShortNames(boolean outputShortNames) {
   // outputShortNames_ = outputShortNames;
    return this;
  }

  public JSONFObjectFormatter setOutputDefaultValues(boolean outputDefaultValues) {
    outputDefaultValues_ = outputDefaultValues;
    return this;
  }

  public JSONFObjectFormatter setOutputDefaultClassNames(boolean f) {
    outputDefaultClassNames_ = f;
    return this;
  }

  public JSONFObjectFormatter setOutputReadableDates(boolean f) {
    outputReadableDates_ = f;
    return this;
  }

  public JSONFObjectFormatter setMultiLine(boolean ml) {
    multiLineOutput_ = ml;
    return this;
  }

  public JSONFObjectFormatter setOutputClassNames(boolean outputClassNames) {
    outputClassNames_ = outputClassNames;
    return this;
  }

  public void outputKey(String val) {
    if ( quoteKeys_ ) appendQuote();
    append(val);
    if ( quoteKeys_ ) appendQuote();
  }
}
