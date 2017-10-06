/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.dao.pg.IndexedPreparedStatement;
import foam.nanos.logger.Logger;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Map;

public abstract class AbstractPropertyInfo
    implements PropertyInfo
{
  protected ClassInfo parent;

  @Override
  public PropertyInfo setClassInfo(ClassInfo p) {
    parent = p;
    return this;
  }

  @Override
  public ClassInfo getClassInfo() {
    return parent;
  }

  @Override
  public void toJSON(foam.lib.json.Outputter outputter, Object value) {
    outputter.output(value);
  }

  @Override
  public void toCSV(foam.lib.csv.Outputter outputter, Object value) {
    outputter.output(value);
  }

  @Override
  public foam.mlang.Expr partialEval() {
    return this;
  }

  @Override
  public String createStatement() {
    return getName();
  }

  @Override
  public void prepareStatement(IndexedPreparedStatement stmt) {
  }

  @Override
  public Object f(FObject o) {
    return get(o);
  }

  @Override
  public void diff(FObject o1, FObject o2, Map diff, PropertyInfo prop) {
    if ( ! prop.f(o1).equals(prop.f(o2)) ) {
      diff.put(prop.getName(), prop.f(o2));
    }
  }

  public void setFromString(Object obj, String value) {
    // TODO: Need to write
  }

  @Override
  public Object fromXML(X x, XMLStreamReader reader) {
    // Moves reader to characters state in order for value reading for various data types (date, boolean, short ...)
    try {
      reader.next();
    } catch (XMLStreamException ex) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Premature end of XML file");
    }
    return "";
  }

  @Override
  public void toXML(FObject obj, Document doc, Element objElement) {
    Object value = this.f(obj);
    if ( value != null && value != "" ) {
      Element prop = doc.createElement(this.getName());
      prop.appendChild(doc.createTextNode(value.toString()));
      objElement.appendChild(prop);
    }
  }
}
