/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.util.SafetyUtil;

import javax.xml.stream.XMLStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public abstract class AbstractStringPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(String o1, String o2) {
    return o1.compareTo(o2);
  }
  
  public abstract int getWidth();

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
  public void hash(FObject obj, MessageDigest md) {
    String val = (String) get(obj);
    if ( SafetyUtil.isEmpty(val) ) {
      return;
    }
    md.update(val.getBytes(StandardCharsets.UTF_8));
  }
}