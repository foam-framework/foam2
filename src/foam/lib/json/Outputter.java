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
import java.io.*;
import java.security.PrivateKey;
import java.text.SimpleDateFormat;
import java.util.Iterator;
import java.util.List;
import org.apache.commons.io.IOUtils;
import org.bouncycastle.util.encoders.Base64;

public class Outputter
  extends AbstractSink
  implements foam.lib.Outputter
{

  protected ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.S'Z'");
      df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
      return df;
    }
  };

  protected PrintWriter   writer_;
  protected OutputterMode mode_;
  protected StringWriter  stringWriter_        = null;
  protected boolean       outputDefaultValues_ = false;
  protected boolean       outputClassNames_    = true;

  // Hash properties
  protected String        hashAlgo_            = "SHA-256";
  protected boolean       outputHash_          = false;
  protected boolean       rollHashes_          = false;
  protected byte[]        previousHash_        = null;
  protected final Object  hashLock_            = new Object();

  // signing properties
  protected String        signAlgo_            = null;
  protected PrivateKey    signingKey_          = null;
  protected boolean       outputSignature_     = false;

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

    this.mode_   = mode;
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
      .replace("\\", "\\\\")
      .replace("\"", "\\\"")
      .replace("\t", "\\t")
      .replace("\n","\\n");
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

  protected Boolean maybeOutputProperty(FObject fo, PropertyInfo prop, boolean includeComma) {
    if ( mode_ == OutputterMode.NETWORK && prop.getNetworkTransient() ) return false;
    if ( mode_ == OutputterMode.STORAGE && prop.getStorageTransient() ) return false;
    if ( ! outputDefaultValues_ && ! prop.isSet(fo) ) return false;

    Object value = prop.get(fo);	
    if ( value == null ) return false;

    if ( includeComma ) writer_.append(",");
    outputProperty(fo, prop);
    return true;
  }

  protected void outputFObject(FObject o) {
    ClassInfo info = o.getClassInfo();
    writer_.append("{");
    if ( outputClassNames_ ) {
      writer_.append(beforeKey_());
      writer_.append("class");
      writer_.append(afterKey_());
      writer_.append(":");
      outputString(info.getId());
    }
    List axioms = info.getAxiomsByClass(PropertyInfo.class);
    Iterator i = axioms.iterator();
    boolean outputComma = outputClassNames_;
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      outputComma = maybeOutputProperty(o, prop, outputComma) || outputComma;
    }

    if ( outputHash_ ) {
      writer_.append(",");
      outputHash(o);
    }

    if ( outputSignature_ ) {
      writer_.append(",");
      outputSignature(o);
    }

    writer_.append("}");
  }

  protected void outputHash(FObject o) {
    String hash;
    if ( rollHashes_ ) {
      synchronized ( hashLock_ ) {
        previousHash_ = o.hash(hashAlgo_, previousHash_);
        hash = Base64.toBase64String(previousHash_);
      }
    } else {
      hash = Base64.toBase64String(
          o.hash(hashAlgo_, null));
    }

    writer_.append(beforeKey_())
        .append("hash")
        .append(afterKey_())
        .append(":")
        .append("\"")
        .append(hash)
        .append("\"");
  }

  protected void outputSignature(FObject o) {
    String signature = Base64.toBase64String(
        o.sign(signAlgo_, signingKey_));

    writer_.append(beforeKey_())
        .append("signature")
        .append(afterKey_())
        .append(":")
        .append("\"")
        .append(signature)
        .append("\"");
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
    outputString(prop.getName());
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
  public void put(Object obj, Detachable sub) {
    outputFObject((FObject)obj);
  }

  public void outputRawString(String str) {
    writer_.append(str);
  }

  public void setOutputDefaultValues(boolean outputDefaultValues) {
    outputDefaultValues_ = outputDefaultValues;
  }

  public void setOutputClassNames(boolean outputClassNames) {
    outputClassNames_ = outputClassNames;
  }

  public void setHashAlgorithm(String algorithm) {
    hashAlgo_ = algorithm;
  }

  public void setOutputHash(boolean outputHash) {
    outputHash_ = outputHash;
  }

  public void setRollHashes(boolean rollHashes) {
    rollHashes_ = rollHashes;
  }

  public void setOutputSignature(boolean outputSignature) {
    outputSignature_ = outputSignature;
  }

  public void setSigningAlgorithm(String algorithm) {
    signAlgo_ = algorithm;
  }

  public void setSigningKey(PrivateKey signingKey) {
    signingKey_ = signingKey;
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
