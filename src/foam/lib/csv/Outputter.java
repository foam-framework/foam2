/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.core.*;
import foam.dao.AbstractSink;
import foam.lib.json.OutputterMode;
import foam.util.SafetyUtil;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.TimeZone;

public class Outputter
    extends AbstractSink
{

  protected ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.S'Z'");
      df.setTimeZone(TimeZone.getTimeZone("UTC"));
      return df;
    }
  };

  protected ClassInfo          of_           = null;
  protected List<PropertyInfo> props_        = null;
  protected StringWriter       stringWriter_ = null;
  protected PrintWriter        writer_;
  protected OutputterMode      mode_;
  protected boolean            outputHeaders_;
  protected boolean            isHeadersOutput_ = false;

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
    if ( stringWriter_ == null ) {
      stringWriter_ = new StringWriter();
      writer_ = new PrintWriter(stringWriter_);
    }

    stringWriter_.getBuffer().setLength(0);
    if ( outputHeaders_ )
      outputHeaders(obj);

    outputFObject(obj);
    return this.toString();
  }

  /**
   * Gets a filtered list of properties. Removes network and storage transient variables
   * if necessary, removes unsupported types and removes null values / empty strings
   * @param obj the object to get the property list from
   * @return the filtered list of properties
   */
  public List<PropertyInfo> getFilteredPropertyInfoList(FObject obj) {
    if ( of_ != null && props_ != null && obj.getClassInfo().equals(of_) )
      return props_;

    of_ = obj.getClassInfo();
    List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    for ( PropertyInfo prop : props ) {
      // filter out network and storage transient values
      if ( mode_ == OutputterMode.NETWORK && prop.getNetworkTransient() ) continue;
      if ( mode_ == OutputterMode.STORAGE && prop.getStorageTransient() ) continue;

      // filter out unsupported types
      if ( prop instanceof AbstractArrayPropertyInfo ||
          prop instanceof AbstractFObjectArrayPropertyInfo ||
          prop instanceof AbstractFObjectPropertyInfo ) {
        continue;
      }

      // filter out null values & empty strings
      Object value = prop.f(obj);
      if ( value == null ) continue;
      if ( value instanceof String && ((String) value).isEmpty() ) continue;

      props_.add(prop);
    }

    return props_;
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
    if ( SafetyUtil.isEmpty(s) ) return;
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

  public void output(Object value) {
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
    if ( outputHeaders_ && ! isHeadersOutput_ ) {
      outputHeaders(obj);
      isHeadersOutput_ = true;
    }
    outputFObject(obj);
  }
}
