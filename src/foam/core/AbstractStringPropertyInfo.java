/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.util.SafetyUtil;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.Signature;
import java.security.SignatureException;
import javax.xml.stream.XMLStreamReader;

public abstract class AbstractStringPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(String o1, String o2) {
    return o1.compareTo(o2);
  }

  // public void setFromString(Object obj, String value) {
  //   this.set(obj, value);
  // }

  public Object fromString(String value) {
    return value;
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    super.fromXML(x, reader);
    return reader.getText();
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    String val = (String) get(obj);
    if ( SafetyUtil.isEmpty(val) ) return;
    md.update(val.getBytes(StandardCharsets.UTF_8));
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    String val = (String) get(obj);
    if ( SafetyUtil.isEmpty(val) ) return;
    sig.update(val.getBytes(StandardCharsets.UTF_8));
  }
  
  public Class getValueClass() {
    return String.class;
  }

  public String cast(Object o) {
    return ( o instanceof Number ) ?
            ((Number) o).toString() : (String) o;
  }

  public abstract Object get(Object o) ;

  public int compare(Object o1, Object o2) {
    return foam.util.SafetyUtil.compare(get_(o1), get_(o2));
  }

  public int comparePropertyToObject(Object key, Object o) {
    return foam.util.SafetyUtil.compare(cast(key), get_(o));
  }

  public int comparePropertyToValue(Object key, Object value) {
    return foam.util.SafetyUtil.compare(cast(key), cast(value));
  }

  public foam.lib.parse.Parser jsonParser() {
    return foam.lib.json.StringParser.instance();
  }

  public foam.lib.parse.Parser queryParser() {
    return foam.lib.query.StringParser.instance();
  }

  public foam.lib.parse.Parser csvParser() {
    return foam.lib.csv.CSVStringParser.instance();
  }
  
  public boolean isDefaultValue(Object o) {
    return foam.util.SafetyUtil.compare(get_(o), "") == 0;
  }

  protected abstract String get_(Object o);

  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    formatter.output(get_(obj));
  }
}
