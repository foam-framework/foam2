/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.dao.SQLStatement;
import foam.lib.parse.Parser;
import foam.mlang.Expr;
import foam.mlang.order.Comparator;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.stream.XMLStreamReader;
import java.util.Map;

// ???: Why is this interface mutable?
public interface PropertyInfo
    extends Expr, Comparator, SQLStatement, Axiom
{
  public PropertyInfo setClassInfo(ClassInfo p);
  public ClassInfo getClassInfo();

  public boolean getNetworkTransient();
  public boolean getStorageTransient();
  public boolean getRequired();
  public Class getValueClass();
  public String getName();
  public Object get(Object obj);
  public void set(Object obj, Object value);
  public Parser jsonParser();
  public Parser csvParser();
  public void toJSON(foam.lib.json.Outputter outputter, Object value);
  public void toCSV(foam.lib.csv.Outputter outputter, Object value);
  public void diff(FObject o1, FObject o2, Map diff, PropertyInfo prop);
  public void setFromString(Object obj, String value);
  public Object fromXML(X x, XMLStreamReader reader);
  public void toXML(FObject obj, Document doc, Element objElement);
  public int comparePropertyToObject(Object key, FObject o);
  public String getSQLType();
  public boolean isSet(Object obj);
  public boolean isDefaultValue(Object obj);
}