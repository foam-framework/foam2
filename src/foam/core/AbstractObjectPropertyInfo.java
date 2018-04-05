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

public abstract class AbstractObjectPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(Object o1, Object o2) {
    return ((Comparable)o1).compareTo(o2);
  }

  public void setFromString(Object obj, String value) { }

  public Object fromString(String value) {
    //TODO
    return "";
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    return "";
  }

  @Override
  public void toXML(FObject obj, Document dom, Element objElement) { }

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
}
