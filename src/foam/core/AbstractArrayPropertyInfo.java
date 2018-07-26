/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.dao.pg.IndexedPreparedStatement;
import foam.nanos.logger.Logger;
import java.lang.UnsupportedOperationException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

public abstract class AbstractArrayPropertyInfo
  extends AbstractPropertyInfo
{

  public Object fromString(String value) {
    if ( value == null )
      return null;

    //TODO: add support for other array types
    return foam.util.StringUtil.split(value, ',');
  }

  public abstract String of();

  // NESTED ARRAY
  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    List objList = new ArrayList();
    String startTag = reader.getLocalName();
    try {
      int eventType;
      while ( reader.hasNext() ) {
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            if ( reader.getLocalName().equals("value") ) {
              // TODO: TYPE CASTING FOR PROPER CONVERSION. NEED FURTHER SUPPORT FOR PRIMITIVE TYPES
              throw new UnsupportedOperationException("Primitive typed array XML reading is not supported yet");
            }
            break;
          case XMLStreamConstants.END_ELEMENT:
            if ( reader.getLocalName() == startTag ) { return objList.toArray(); }
        }
      }
    } catch (XMLStreamException ex) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Premature end of XML file");
    }
    return objList.toArray();
  }

  @Override
  public void toXML (FObject obj, Document doc, Element objElement) {
    Object value = this.f(obj);

    // Return if some kind of array other than Object[], like int[]
    if ( value == null || ! ( value instanceof Object[]) ) return;

    Object[] nestObj = (Object[]) value;
    Element  prop    = doc.createElement(this.getName());

    objElement.appendChild(prop);

    for ( int k = 0; k < nestObj.length; k++ ) {
      Element nestedProp = doc.createElement("value");
      nestedProp.appendChild(doc.createTextNode(nestObj[k].toString()));
      prop.appendChild(nestedProp);
    }
  }

  @Override
  public void setStatementValue(IndexedPreparedStatement stmt, FObject o) throws java.sql.SQLException {
    Object obj = this.get(o);
    if ( obj == null ) {
      stmt.setObject(null);
      return;
    }
    Object[] os = (Object[]) obj;
    StringBuilder sb = new StringBuilder();
    int length = os.length;
    if ( length == 0 ) {
      stmt.setObject(null);
      return;
    }
    for ( int i = 0 ; i < length ; i++ ) {
      if ( os[i] == null ) {
        sb.append("");
      } else {
        escapeCommasAndAppend(sb, os[i]);
      }
      if ( i < length - 1 ) {
        sb.append(",");
      }
    }
    stmt.setObject(sb.toString());
  }

  @Override
  public void setFromResultSet(java.sql.ResultSet resultSet, int index, FObject o) throws java.sql.SQLException {
    String value = (String) resultSet.getObject(index);
    setFromString(o, value);
  }

  private void escapeCommasAndAppend(StringBuilder builder, Object o) {
    String s = o.toString();
    //replace backslash to double backslash
    s = s.replace("\\", "\\\\");
    //replace comma to backslash+comma
    s = s.replace(",", "\\,");
    builder.append(s);
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
}
