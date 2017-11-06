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
import java.util.List;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

public abstract class AbstractArrayPropertyInfo
  extends AbstractPropertyInfo
{
  @Override
  public void setFromString(Object obj, String value) {
    if ( value == null ) {
      set(obj, value);
    } 
    String[] s  = value.split(",", -1);
    set(obj, s);
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
    if ( this.f(obj) == null ) return;

    Element prop = doc.createElement(this.getName());
    objElement.appendChild(prop);

    Object[] nestObj = (Object[]) this.f(obj);
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
    java.lang.StringBuilder sb = new java.lang.StringBuilder();
    int length = os.length;
    for ( int i=0; i < length; i++) {
      if( os[i] == null )
        sb.append("");
      else
        sb.append(os[i]);
      if ( i < length - 1 ) {
        sb.append(",");
      }
    }
    stmt.setObject(sb.toString());
  }

  @Override
  public void setFromResultSet(java.sql.ResultSet resultSet, int index, FObject o) {
    prop.setFromString(o, (String)resultSet.getObject(index));
  }
}
