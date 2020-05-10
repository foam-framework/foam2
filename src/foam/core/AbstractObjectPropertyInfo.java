/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import javax.xml.stream.XMLStreamReader;
import javax.xml.stream.XMLStreamWriter;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import foam.box.RPCReturnMessage;

public abstract class AbstractObjectPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(Object o1, Object o2) {
    return ((Comparable)o1).compareTo(o2);
  }

  public void setFromString(Object obj, String value) { }

  public Object fromString(String value) {
    return value;
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    return "";
  }

  @Override
  public boolean hardDiff(FObject o1, FObject o2, FObject diff) {
    //if both this.get(o1) and this.get(o2) are null, then no difference
    //if one is null and the other one is not null, then difference
    if ( this.get(o1) == null ) {
      if ( this.get(o2) == null ) {
        return false;
      } else {
        //shadow copy, since we only use to print out diff entry in journal
        this.set(diff, this.get(o2));
        return true;
      }
    }
    //Both this.get(o1) and thid.get(o2) are not null
    //The propertyInfo is instance of AbstractObjectProperty, so that there is no way to do nested propertyInfo check
    //No matter if there are point to same instance or not, treat them as difference
    //if there are point to different instance, indeed there are different
    //if there are point to same instance, we can not guarantee if there are no difference comparing with record in the journal.
    //shodow copy
    this.set(diff, this.get(o2));
    return true;
  }
  
  public String getSQLType() {
    return "";
  }

  public Class getValueClass() {
    return Object.class;
  }

  public Object cast(Object o) {
    return o;
  }

  protected abstract Object get_(Object o);

  public int compare(Object o1, Object o2) {
    return foam.util.SafetyUtil.compare(get_(o1), get_(o2));
  }

  public int comparePropertyToObject(Object key, Object o) {
    return foam.util.SafetyUtil.compare(cast(key), get_(o));
  }

  public int comparePropertyToValue(Object key, Object value) {
    return foam.util.SafetyUtil.compare(cast(key), cast(value));
  }

  public foam.lib.parse.Parser queryParser() {
    return foam.lib.query.AnyParser.instance();
  }

  public foam.lib.parse.Parser csvParser() {
    return foam.lib.csv.CSVStringParser.instance();
  }

  public boolean isDefaultValue(Object o) {
    return foam.util.SafetyUtil.compare(get_(o), null) == 0;
  }

  public void format(foam.lib.formatter.FObjectFormatter formatter, foam.core.FObject obj) {
    formatter.output(get_(obj));
  }
}
