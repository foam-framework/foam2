/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.core.*;
import foam.dao.AbstractSink;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Iterator;
import java.util.List;

public class Outputter
  extends AbstractSink
{

  protected ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.S'Z'");
      df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
      return df;
    }
  };

  protected StringWriter stringWriter_ = null;
  protected PrintWriter writer_;
  protected OutputterMode mode_;

  public Outputter() {
    this(OutputterMode.FULL);
  }

  public Outputter(OutputterMode mode) {
    this((PrintWriter) null, mode);
  }

  public Outputter(File file, OutputterMode mode) throws FileNotFoundException {
    this(new PrintWriter(file), mode);
  }

  public Outputter(PrintWriter writer, OutputterMode mode) {
    if ( writer == null ) {
      stringWriter_ = new StringWriter();
      writer = new PrintWriter(stringWriter_);
    }

    this.mode_ = mode;
    this.writer_ = writer;
  }

  public String stringify(FObject obj) {
    if ( stringWriter_ == null ) {
      stringWriter_ = new StringWriter();
      writer_ = new PrintWriter(stringWriter_);
    }

    stringWriter_.getBuffer().setLength(0);
    outputFObject(obj);
    return this.toString();
  }

  protected void outputUndefined() {
  }

  protected void outputNull() {
  }

  protected void outputString(String s) {
    writer_.append("\"");
    writer_.append(escape(s));
    writer_.append("\"");
  }

  public String escape(String s) {
    return s
      .replace("\t", "\\t")
      .replace("\n","\\n")
      .replace("\"", "\\\"");
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
    writer_.append(p.getName());
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
    while(i < values.length ) {
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
    outputNumber(value.ordinal());
  }

  public void output(Object value) {
    if ( value instanceof OutputJSON ) {
      ((OutputJSON) value).outputJSON(this);
    } else if ( value instanceof String ) {
      outputString((String) value);
    } else if ( value instanceof FObject ) {
      outputFObject((FObject) value);
    } else if ( value instanceof PropertyInfo) {
      outputPropertyInfo((PropertyInfo) value);
    } else if ( value instanceof Number ) {
      outputNumber((Number) value);
    } else if ( isArray(value) ) {
      outputArray((Object[]) value);
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
    return ( value != null ) &&
        ( value.getClass() != null ) &&
        value.getClass().isArray();
  }

  protected void outputDate(java.util.Date date) {
    outputString(sdf.get().format(date));
  }

  protected void outputFObject(FObject o) {
    ClassInfo info = o.getClassInfo();
    writer_.append("{");
    writer_.append(beforeKey_());
    writer_.append("class");
    writer_.append(afterKey_());
    writer_.append(":");

    outputString(info.getId());

    List axioms = info.getAxiomsByClass(PropertyInfo.class);
    Iterator i = axioms.iterator();

    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      if ( mode_ == OutputterMode.NETWORK && prop.getNetworkTransient() ) continue;
      if ( mode_ == OutputterMode.STORAGE && prop.getStorageTransient() ) continue;
      if ( prop instanceof AbstractMultiPartIDPropertyInfo ) continue;

      Object value = prop.get(o);
      if ( value == null ) continue;

      writer_.append(",");
      outputProperty(o, prop);
    }

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
    outputString(prop.getClassInfo().getId() + "." + prop.getName());
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

  @Override
  public String toString() {
    return ( stringWriter_ != null ) ? stringWriter_.toString() : null;
  }

  @Override
  public void put(FObject obj, Detachable sub) {
    outputFObject(obj);
  }

  public void outputRawString(String str) {
    writer_.append(str);
  }
}
