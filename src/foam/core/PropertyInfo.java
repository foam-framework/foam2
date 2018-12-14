/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.crypto.hash.Hasher;
import foam.crypto.sign.Signer;
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
    extends Axiom, Comparator, Expr, SQLStatement, Validator, Hasher, Signer
{
  public PropertyInfo setClassInfo(ClassInfo p);
  public ClassInfo getClassInfo();

  public boolean getNetworkTransient();
  public boolean getPermissionRequired();
  public boolean getStorageTransient();
  public boolean getXMLAttribute();
  public boolean getXMLTextNode();
  public boolean getRequired();
  public Class getValueClass();
  public String getName();
  public String[] getAliases();
  public String getShortName();
  public byte[] getNameAsByteArray();
  public Object get(Object obj);
  public void set(Object obj, Object value);
  public void clear(Object obj);
  public Parser jsonParser();
  public Parser queryParser();
  public Parser csvParser();
  public void toJSON(foam.lib.json.Outputter outputter, Object value);
  public void toCSV(foam.lib.csv.Outputter outputter, Object value);
  public void toXML(foam.lib.xml.Outputter outputter, Object value);
  public void diff(FObject o1, FObject o2, Map diff, PropertyInfo prop);
  //return true if there are difference, then the property value from o2 will set to diff
  //return false if there is no differnce, then null will be set to diff
  public boolean hardDiff(FObject o1, FObject o2, FObject diff);
  public Object fromString(String value);
  public void setFromString(Object obj, String value);
  public Object fromXML(X x, XMLStreamReader reader);
  public int comparePropertyToObject(Object key, Object o);
  public int comparePropertyToValue(Object key, Object value);
  public String getSQLType();
  public boolean isSet(Object obj);
  public boolean isDefaultValue(Object obj);
  public void setStatementValue(foam.dao.pg.IndexedPreparedStatement stmt, FObject o) throws java.sql.SQLException;
  public void setFromResultSet(java.sql.ResultSet resultSet, int index, FObject o) throws java.sql.SQLException;
  public void cloneProperty(FObject source, FObject dest);
  public boolean containsPII();
  public boolean containsDeletablePII();
}
