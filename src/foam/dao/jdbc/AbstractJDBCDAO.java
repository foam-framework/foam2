/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.jdbc;

import foam.dao.AbstractDAO;

import foam.core.*;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.sql.*;

import java.lang.Exception;
import java.util.*;

public abstract class AbstractJDBCDAO extends AbstractDAO{

  /** Holds the relevant properties (column names) of the table */
  protected List<PropertyInfo> properties_;

  protected ThreadLocal<StringBuilder> threadLocalBuilder_ = new ThreadLocal<StringBuilder>(){

    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder builder = super.get();
      builder.setLength(0);
      return builder;
    }

  };

  protected String tableName_;

  /** Holds a reference to the connection pool ( .getConnection() ) */
  protected static DataSource dataSource_;

  /**
   * Create the table in the database and return true if it doesn't already exist otherwise it does nothing and returns false
   * @param of ClassInfo
   */
  public abstract boolean createTable(X x, ClassInfo of);

  public AbstractJDBCDAO(X x, ClassInfo of, String poolName) throws java.sql.SQLException, ClassNotFoundException {
    setX(x);
    setOf(of);

    // Get the system global dataSource with its system global pool
    JDBCPooledDataSource jp = new JDBCPooledDataSource(x, poolName);
    dataSource_ = jp.getDataSource(x, poolName);

    tableName_ = of.getObjClass().getSimpleName().toLowerCase();

    getObjectProperties(of);

    if ( ! createTable(x, of) ) {
      // Table already created (may happen after a system restart).
    }

  }

  /**
   * Returns list of properties of a metaclass
   * @param of ClassInfo
   */
  protected void getObjectProperties(ClassInfo of){

    if(properties_ == null) {
      List<PropertyInfo> allProperties = of.getAxiomsByClass(PropertyInfo.class);
      properties_ = new ArrayList<PropertyInfo>();
      for (PropertyInfo prop : allProperties) {
        if (prop.getStorageTransient())
          continue;
        if ("".equals(prop.getSQLType()))
          continue;
        properties_.add(prop);
      }
    }
  }

  /**
   * Creates an FObject with the appropriate meta-properties.
   * @param resultSet
   * @return
   * @throws Exception
   */
  protected FObject createFObject(ResultSet resultSet) throws Exception {
    if ( getOf() == null ) {
      throw new Exception("`Of` is not set");
    }

    FObject obj = (FObject) getOf().getObjClass().newInstance();
    ResultSetMetaData metaData = resultSet.getMetaData();

    int index = 1;
    Iterator i = properties_.iterator();
    while ( i.hasNext() ) {
      // prevent reading out of bounds of result set
      if ( index > metaData.getColumnCount() )
        break;
      // get the property and set the value
      PropertyInfo prop = (PropertyInfo) i.next();
      prop.setFromResultSet(resultSet, index++, obj);
//      prop.set(obj, resultSet.getObject(index++));
    }

    return obj;
  }

  /**
   * Sets the value of the PrepareStatement
   * @param stmt statement to set values
   * @param obj object to get values from
   * @return the updated index
   * @throws SQLException
   */
  public void setStatementValues(IndexedPreparedStatement stmt, FObject obj) throws SQLException {
    Iterator i = properties_.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      prop.setStatementValue(stmt, obj);
    }
  }

  /**
   * Closes resources without throwing exceptions
   * @param resultSet ResultSet
   * @param stmt IndexedPreparedStatement
   */
  public void closeAllQuietly(ResultSet resultSet, IndexedPreparedStatement stmt) {
    if ( resultSet != null )
      try { resultSet.close(); } catch (Throwable ignored) {}
    if ( stmt != null )
      try { stmt.close(); } catch (Throwable ignored) {}
  }

}
