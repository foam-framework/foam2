/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.core.ClassInfo;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.AbstractSink;
import foam.lib.PermissionedPropertyPredicate;
import foam.lib.PropertyPredicate;
import foam.util.SafetyUtil;
import java.io.*;
import java.lang.reflect.Array;
import java.text.SimpleDateFormat;
import java.util.Iterator;
import java.util.List;
import java.util.*;
import org.apache.commons.io.IOUtils;

public class Outputter
  extends    AbstractSink
  implements foam.lib.Outputter
{

  protected static ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
      return df;
    }
  };

  protected foam.core.X       x_;
  public    PrintWriter       writer_;
  protected StringWriter      stringWriter_        = null;
  protected boolean           outputShortNames_    = false;
  protected boolean           outputDefaultValues_ = false;
  protected boolean           multiLineOutput_     = false;
  protected boolean           outputClassNames_    = true;
  protected boolean           outputReadableDates_ = true;
  protected PropertyPredicate propertyPredicate_;
  protected Map<String, List<PropertyInfo>> propertyMap_ = new HashMap<>();


  public Outputter(foam.core.X x) {
    this(x, (PrintWriter) null);
  }

  public Outputter(foam.core.X x, File file) throws FileNotFoundException {
    this(x, new PrintWriter(file));
  }

  public Outputter(foam.core.X x, PrintWriter writer) {
    if ( writer == null ) {
      stringWriter_ = new StringWriter();
      writer        = new PrintWriter(stringWriter_);
    }

    this.x_ = x;
    this.writer_ = writer;
  }

  @Override
  public String stringify(FObject obj) {
    initWriter();
    outputFObject(obj);
    return this.toString();
  }

  public String stringifyDelta(FObject oldFObject, FObject newFObject) {
    initWriter();
    outputFObjectDelta(oldFObject, newFObject);
    return this.toString();
  }

  protected void initWriter() {
    if ( stringWriter_ == null ) {
      stringWriter_ = new StringWriter();
      writer_       = new PrintWriter(stringWriter_);
    }
    stringWriter_.getBuffer().setLength(0);
  }

  public void setWriter(PrintWriter writer) {
    writer_ = writer;
  }

  public void setOutputReadableDates(boolean f) {
    outputReadableDates_ = f;
  }

  protected void outputUndefined() {
  }

  protected void outputNull() {
  }

  public void outputString(String s) {
    if ( multiLineOutput_ && s.indexOf('\n') >= 0 ) {
      writer_.append("\n");
      writer_.append("\"\"\"");
      writer_.append(escapeMultiline(s));
      writer_.append("\"\"\"");
    }
    else {
      writer_.append("\"");
      writer_.append(escape(s));
      writer_.append("\"");
    }
  }

  public String escape(String s) {
    // I tested with a ThreadLocal StringBuilder, but
    // not faster in Java 11. KGR
    StringBuilder sb = new StringBuilder();
    foam.lib.json.Util.escape(s, sb);
    return sb.toString();
    /*
    s = s.replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\t", "\\t")
            .replace("\r","\\r")
            .replace("\n","\\n");
    s = escapeControlCharacters(s);
    return s;
    */
  }

  public String escapeMultiline(String s) {
    s = s.replace("\\", "\\\\");
    s = escapeControlCharacters(s);
    return s;
  }

  public String escapeControlCharacters(String s) {
    int lastStart = 0;
    String escapedString = "";
    char c;
    for ( int i = 0; i < s.length(); i++ ) {
      c = s.charAt(i);
      if ( c >= ' ' ) continue;
      // Character to hex
      char right = (char) (c & 0x0F);
      char left = (char) ((c & 0xF0) >> 4);
      right += '0';
      if ( right > '9' ) right += 'A' - '9' - 1;
      left += '0';
      if ( left > '9' ) left += 'A' - '9' - 1;
      char[] escape = new char[] {'\\','u','0','0',left,right};
      // Add previous string segment
      escapedString += s.substring(lastStart, i);
      // Add escape sequence
      escapedString += new String(escape);
      lastStart = i + 1;
    }
    if ( lastStart != s.length() ) escapedString +=
      s.substring(lastStart, s.length());
    return escapedString;
  }

  protected void outputNumber(Number value) {
    writer_.append(value.toString());
  }

  protected void outputBoolean(Boolean value) {
    writer_.append( value ? "true" : "false" );
  }

  protected void outputArray(Object[] array) {
    writer_.append("[");
    for ( int i = 0 ; i < array.length ; i++ ) {
      output(array[i]);
      if ( i < array.length - 1 ) writer_.append(",");
    }
    writer_.append("]");
  }

  protected void outputByteArray(byte[][] array) {
    writer_.append("[");
    for ( int i = 0 ; i < array.length ; i++ ) {
      output(array[i]);
      if ( i < array.length - 1 ) writer_.append(",");
    }
    writer_.append("]");
  }

  protected void outputByteArray(byte[] array) {
    output(foam.util.SecurityUtil.ByteArrayToHexString(array));
  }

  protected void outputMap(java.util.Map map) {
    writer_.append("{");
    java.util.Iterator keys = map.keySet().iterator();
    while ( keys.hasNext() ) {
      Object key   = keys.next();
      Object value = map.get(key);
      outputString(key == null ? "" : key.toString());
      writer_.append(":");
      output(value);
      if ( keys.hasNext() ) writer_.append(",");
    }
    writer_.append("}");
  }

  protected void outputList(java.util.List list) {
    writer_.append("[");
    java.util.Iterator iter = list.iterator();
    while ( iter.hasNext() ) {
      output(iter.next());
      if ( iter.hasNext() ) writer_.append(",");
    }
    writer_.append("]");
  }

  protected void outputProperty(FObject o, PropertyInfo p) {
    writer_.append(beforeKey_());
    writer_.append(getPropertyName(p));
    writer_.append(afterKey_());
    writer_.append(":");
    p.toJSON(this, p.get(o));
  }

  public void outputMap(Object... values) {
    if ( values.length % 2 != 0 ) {
      throw new RuntimeException("Need even number of arguments for outputMap");
    }

    writer_.append("{");
    int i = 0;
    while ( i < values.length ) {
      writer_.append(beforeKey_());
      writer_.append(values[i++].toString());
      writer_.append(afterKey_());
      writer_.append(":");
      output(values[i++]);
      if ( i < values.length ) writer_.append(",");
    }
    writer_.append("}");
  }

  public void outputEnum(Enum<?> value) {
//    outputNumber(value.ordinal());

    writer_.append("{");
      writer_.append(beforeKey_());
      writer_.append("class");
      writer_.append(afterKey_());
      writer_.append(":");
      outputString(value.getClass().getName());
      writer_.append(",");
      writer_.append(beforeKey_());
      writer_.append("ordinal");
      writer_.append(afterKey_());
      writer_.append(":");
      outputNumber(value.ordinal());
    writer_.append("}");
  }

  @Override
  public void output(Object value) {
    if ( value instanceof OutputJSON ) {
      ((OutputJSON) value).outputJSON(this);
    } else if ( value instanceof String ) {
      outputString((String) value);
    } else if ( value instanceof FObject ) {
      outputFObject((FObject) value);
    } else if ( value instanceof PropertyInfo) {
      outputPropertyInfo((PropertyInfo) value);
    } else if ( value instanceof ClassInfo ) {
      outputClassInfo((ClassInfo) value);
    } else if ( value instanceof Number ) {
      outputNumber((Number) value);
    } else if ( isArray(value) ) {
        if ( value.getClass().equals(byte[][].class) ) {
          outputByteArray((byte[][]) value);
        } else if ( value instanceof byte[] ) {
          outputByteArray((byte[]) value);
        }
        else {
          outputArray((Object[]) value);
        }
    } else if ( value instanceof Boolean ) {
      outputBoolean((Boolean) value);
    } else if ( value instanceof java.util.Date ) {
      outputDate((java.util.Date) value);
    } else if ( value instanceof java.util.Map ) {
      outputMap((java.util.Map) value);
    } else if ( value instanceof java.util.List ) {
      outputList((java.util.List) value);
    } else if ( value instanceof Enum<?> ) {
      outputEnum((Enum<?>) value);
    } else /*if ( value == null )*/ {
      writer_.append("null");
    }
  }

  protected boolean isArray(Object value) {
    return value != null &&
        ( value.getClass() != null ) &&
        value.getClass().isArray();
  }

  public void outputDateValue(java.util.Date date) {
    if ( outputReadableDates_ )
      outputString(sdf.get().format(date));
    else
      outputNumber(date.getTime());
  }

  protected void outputDate(java.util.Date date) {
    writer_.append("{\"class\":\"__Timestamp__\",\"value\":");
    outputDateValue(date);
    writer_.append("}");
  }

  protected synchronized List getProperties(ClassInfo info) {
    String of = info.getObjClass().getSimpleName();

    if ( propertyMap_.containsKey(of) && propertyMap_.get(of).isEmpty() ) {
      propertyMap_.remove(of);
    }

    if ( ! propertyMap_.containsKey(of) ) {
      List<PropertyInfo> filteredAxioms = new ArrayList<>();
      Iterator e = info.getAxiomsByClass(PropertyInfo.class).iterator();
      while ( e.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) e.next();
        if ( propertyPredicate_ == null || propertyPredicate_.propertyPredicateCheck(this.x_, of.toLowerCase(), prop) ) {
          filteredAxioms.add(prop);
        }
      }
      propertyMap_.put(of, filteredAxioms);
      return filteredAxioms;
    }
    return propertyMap_.get(of);
  }

  protected Boolean maybeOutputProperty(FObject fo, PropertyInfo prop, boolean includeComma) {

    if ( ! outputDefaultValues_ && ! prop.isSet(fo) ) return false;

    Object value = prop.get(fo);
    if ( value == null || ( isArray(value) && Array.getLength(value) == 0 ) ) {
      return false;
    }

    if ( includeComma ) writer_.append(",");
    if ( multiLineOutput_ ) addInnerNewline();
    outputProperty(fo, prop);
    return true;
  }

  protected void outputFObjectDelta(FObject oldFObject, FObject newFObject) {
    ClassInfo info           = oldFObject.getClassInfo();
    ClassInfo newInfo        = newFObject.getClassInfo();
    boolean   outputComma    = true;
    boolean   isDiff         = false;
    boolean   isPropertyDiff = false;

    if ( ! oldFObject.equals(newFObject) ) {
      List     axioms = getProperties(info);
      Iterator i      = axioms.iterator();

      writer_.append("{");
      if ( multiLineOutput_ ) addInnerNewline();
      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        isPropertyDiff = maybeOutputPropertyDelta(oldFObject, newFObject, prop);
        if ( isPropertyDiff) {
          if ( ! isDiff ) {
            if ( outputClassNames_ ) {
              //output Class name
              writer_.append(beforeKey_());
              writer_.append("class");
              writer_.append(afterKey_());
              writer_.append(":");
              outputString(newInfo.getId());
            }
            if ( outputClassNames_ ) writer_.append(",");
            addInnerNewline();
            PropertyInfo id = (PropertyInfo) newInfo.getAxiomByName("id");
            outputProperty(newFObject, id);
            isDiff = true;
          }
          writer_.append(",");
          addInnerNewline();
          outputProperty(newFObject, prop);
        }
      }

      if ( isDiff ) {
        if ( multiLineOutput_ )  writer_.append("\n");
        writer_.append("}");
      }
    }
  }

  protected void addInnerNewline() {
    if ( multiLineOutput_ ) {
      writer_.append("\n");
    }
  }

  protected boolean maybeOutputPropertyDelta(FObject oldFObject, FObject newFObject, PropertyInfo prop) {

    return prop.compare(oldFObject, newFObject) != 0;
  }

  public void outputJSONJFObject(FObject o) {
    writer_.append("p(");
    outputFObject(o);
    writer_.append(")\r\n");
  }

  protected void outputFObject(FObject o) {
    ClassInfo info = o.getClassInfo();

    writer_.append("{");
    if ( multiLineOutput_ ) addInnerNewline();
    if ( outputClassNames_ ) {
      writer_.append(beforeKey_());
      writer_.append("class");
      writer_.append(afterKey_());
      writer_.append(":");
      outputString(info.getId());
    }

    List     axioms      = getProperties(info);
    Iterator i           = axioms.iterator();
    boolean  outputComma = outputClassNames_;
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      outputComma = maybeOutputProperty(o, prop, outputComma) || outputComma;
    }
    if ( multiLineOutput_ ) writer_.append("\n");
    writer_.append("}");
  }

  protected void outputPropertyInfo(PropertyInfo prop) {
    writer_.append("{");
    outputString("class");
    writer_.append(":");
    outputString("__Property__");
    writer_.append(",");
    outputString("forClass_");
    writer_.append(":");
    outputString(prop.getClassInfo().getId());
    writer_.append(",");
    outputString("name");
    writer_.append(":");
    outputString(getPropertyName(prop));
    writer_.append("}");
  }

  protected void outputClassInfo(ClassInfo info) {
    writer_.append("{\"class\":\"__Class__\",\"forClass_\":");
    outputString(info.getId());
    writer_.append("}");
  }

  protected String beforeKey_() {
    return "\"";
  }

  protected String afterKey_() {
    return "\"";
  }

  public FObject parse(String str) {
    return null;
  }

  public String getPropertyName(PropertyInfo p) {
    return outputShortNames_ && ! SafetyUtil.isEmpty(p.getShortName()) ? p.getShortName() : p.getName();
  }

  @Override
  public String toString() {
    return ( stringWriter_ != null ) ? stringWriter_.toString() : null;
  }

  @Override
  public void put(Object obj, Detachable sub) {
    outputFObject((FObject)obj);
  }

  public void outputRawString(String str) {
    writer_.append(str);
  }

  public Outputter setOutputShortNames(boolean outputShortNames) {
    outputShortNames_ = outputShortNames;
    return this;
  }

  public Outputter setOutputDefaultValues(boolean outputDefaultValues) {
    outputDefaultValues_ = outputDefaultValues;
    return this;
  }

  public Outputter setOutputClassNames(boolean outputClassNames) {
    outputClassNames_ = outputClassNames;
    return this;
  }

  public Outputter setPropertyPredicate(PropertyPredicate p) {
    propertyPredicate_ = p;
    return this;
  }

  @Override
  public void close() throws IOException {
    IOUtils.closeQuietly(stringWriter_);
    IOUtils.closeQuietly(writer_);
  }

  @Override
  public void flush() throws IOException {
    if ( stringWriter_ != null ) stringWriter_.flush();
    if ( writer_ != null ) writer_.flush();
  }

  public void setMultiLine(boolean ml) {
    multiLineOutput_ = ml;
  }
}
