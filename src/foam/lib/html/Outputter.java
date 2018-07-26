/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.html;

import foam.core.ClassInfo;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.AbstractSink;
import foam.lib.json.OutputterMode;
import foam.util.SafetyUtil;
import org.apache.commons.io.IOUtils;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.TimeZone;

public class Outputter
  extends AbstractSink
  implements foam.lib.Outputter
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

  public Outputter(OutputStream os, OutputterMode mode, boolean outputHeaders) {
    this(new OutputStreamWriter(os), mode, outputHeaders);
  }

  public Outputter(Writer writer, OutputterMode mode, boolean outputHeaders) {
    this(new PrintWriter(writer), mode, outputHeaders);
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
    /*if ( outputHeaders_ )
      outputHeaders(obj);*/

    outputFObject(obj);
    return this.toString();
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
    ClassInfo info = obj.getClassInfo();

    List axioms = info.getAxiomsByClass(PropertyInfo.class);
    Iterator i = axioms.iterator();

    writer_.append("<tr>");
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      if ( mode_ == OutputterMode.NETWORK && prop.getNetworkTransient() ) continue;
      if ( mode_ == OutputterMode.STORAGE && prop.getStorageTransient() ) continue;

      //outputHead(prop);

      Object value = prop.get(obj);
      if ( value == null ) continue;

      writer_.append("<td>");
      writer_.append(prop.get((Object)obj).toString());
      writer_.append("</td>");
    }
    writer_.append("</tr>");

  }

  public void outputStartHtml() {
    writer_.append("<html><head></head><body>");
  }

  public void outputEndHtml() {
    writer_.append("</body></html>");
  }

  public void outputStartTable() {
    writer_.append("<table>");
  }

  public void outputEndTable() {
    writer_.append("</table>");
  }

  public void outputHead(FObject obj) {
    ClassInfo info = obj.getClassInfo();

    writer_.append("<thead><tr>");
    List<PropertyInfo> prop = info.getAxiomsByClass(PropertyInfo.class);
    for( PropertyInfo pi : prop ) {
      writer_.append("<th>");
      writer_.append(pi.getName());
      writer_.append("</th>");
    }
    writer_.append("</tr></thead>");
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
    } else if ( value instanceof FObject ) {
      outputFObject((FObject) value);
    }
  }

  @Override
  public String toString() {
    return ( stringWriter_ != null ) ? stringWriter_.toString() : null;
  }

  @Override
  public void put(Object obj, Detachable sub) {
    outputFObject((FObject)obj);
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
}
