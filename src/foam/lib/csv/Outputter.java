/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.core.*;
import foam.dao.AbstractSink;
import foam.lib.json.OutputterMode;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.TimeZone;
import java.util.stream.Collectors;

public class Outputter
    extends AbstractSink
{

  protected ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat df = new SimpleDateFormat("YYYY-MM-dd'T'HH:mm:ss.S'Z'");
      df.setTimeZone(TimeZone.getTimeZone("UTC"));
      return df;
    }
  };

  protected StringWriter stringWriter_ = null;
  protected final PrintWriter writer_;
  protected final OutputterMode mode_;
  protected final boolean outputHeaders_;

  public StringWriter createStringWriter() {
    return new StringWriter();
  }

  public Outputter() {
    this(OutputterMode.FULL);
  }

  public Outputter(OutputterMode mode) {
    this((PrintWriter) null, mode, true);
  }

  public Outputter(OutputterMode mode, boolean outputHeaders) {
    this((PrintWriter) null, mode, outputHeaders);
  }

  public Outputter(File file, OutputterMode mode, boolean outputHeaders) throws FileNotFoundException {
    this(new PrintWriter(file), mode, outputHeaders);
  }

  public Outputter(PrintWriter writer, OutputterMode mode, boolean outputHeaders) {
    if ( writer == null ) {
      stringWriter_ = new StringWriter();
      writer = new PrintWriter(stringWriter_);
    }

    this.mode_ = mode;
    this.writer_ = writer;
    this.outputHeaders_ = outputHeaders;
  }

  public String stringify(FObject obj) {
    if ( outputHeaders_ )
      outputHeaders(obj);
    outputFObject(obj);
    return writer_.toString();
  }

  /**
   * Gets a filtered list of properties. Removes network and storage transient variables
   * if necessary, removes unsupported types and removes null values / empty strings
   * @param obj the object to get the property list from
   * @return the filtered list of properties
   */
  public List<PropertyInfo> getFilteredPropertyInfoList(FObject obj) {
    List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    return props.stream().filter(prop -> {
      // filter out network and storage transient values
      if ( mode_ == OutputterMode.NETWORK && prop.getNetworkTransient() ) return false;
      if ( mode_ == OutputterMode.STORAGE && prop.getStorageTransient() ) return false;

      // filter out unsupported types
      if ( prop instanceof AbstractArrayPropertyInfo ||
          prop instanceof AbstractFObjectArrayPropertyInfo ||
          prop instanceof AbstractFObjectPropertyInfo ) {
        return false;
      }

      Object value = prop.f(obj);
      return value != null && (!(value instanceof String) || !((String) value).isEmpty());
    })
        .collect(Collectors.toList());
  }

  public void outputHeaders(FObject obj) {
    List<PropertyInfo> props = getFilteredPropertyInfoList(obj);
    Iterator i = props.iterator();

    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      writer_.append(prop.getName());
      if ( i.hasNext() )
        writer_.append(",");
    }
    writer_.append("\n");
  }

  public String escape(String s) {
    return s.replace("\n","\\n").replace("\"", "\\\"");
  }

  protected void outputString(String s) {
    if ( s == null || s.isEmpty() ) return;
    writer_.append(escape(s));
  }

  protected void outputNumber(Number value) {
    writer_.append(value.toString());
  }

  protected void outputBoolean(Boolean value) {
    writer_.append(value ? "true" : "false");
  }

  protected void outputDate(Date value) {
    outputString(sdf.get().format(value));
  }

  protected void outputFObject(FObject obj) {
    List<PropertyInfo> props = getFilteredPropertyInfoList(obj);
    Iterator i = props.iterator();

    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      prop.toCSV(this, prop.f(obj));
      if ( i.hasNext() )
        writer_.append(",");
    }
    writer_.append("\n");
  }

  public void output(Object value ) {
    if ( value instanceof String ) {
      outputString((String) value);
    } else if ( value instanceof Number ) {
      outputNumber((Number) value);
    } else if ( value instanceof Boolean ) {
      outputBoolean((Boolean) value);
    } else if ( value instanceof Date ) {
      outputDate((Date) value);
    }
  }

  @Override
  public String toString() {
    return ( stringWriter_ != null ) ? stringWriter_.toString() : null;
  }

  @Override
  public void put(FObject obj, Detachable sub) {
//    outputFObject(data_, obj);
  }
}