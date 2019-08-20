/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.jdbc;

import foam.dao.AbstractDAO;
import foam.core.*;
import foam.nanos.logger.Logger;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.sql.*;
import java.lang.Exception;
import java.util.*;

/**
 * Abstract class for implementing JDBC-based DAOs.
 */
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

  protected IndexedPreparedStatement findStmt;
  protected IndexedPreparedStatement removeStmt;
  protected IndexedPreparedStatement insertStmt;

  @Override
  public FObject find_(X x, Object id) {
    Connection c = null;
    ResultSet resultSet = null;

    try {
      if ( findStmt == null ) {
        c = dataSource_.getConnection();
        StringBuilder builder = threadLocalBuilder_.get()
                .append("select * from ")
                .append(tableName_)
                .append(" where ")
                .append(getPrimaryKey().createStatement())
                .append(" = ?");

        findStmt = new IndexedPreparedStatement(c.prepareStatement(builder.toString()));
      }

      // TODO: add support for non-numbers
      //stmt.setLong(((Number) o).longValue());
      findStmt.setObject(id);
      resultSet = findStmt.executeQuery();
      if ( ! resultSet.next() ) {
        // no rows
        return null;
        // In the doc, should be: throw new foam.dao.ObjectNotFoundException();
      }

      return createFObject(resultSet);
    } catch ( Throwable e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
      return null;
    } finally {
      try {
        findStmt.setObject(null);
      } catch (SQLException e) {
        Logger logger = (Logger) x.get("logger");
        logger.error(e);
      }
      closeAllQuietly(resultSet, findStmt);
    }
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    Connection c = null;

    try {
      if ( removeStmt == null ) {
        c = dataSource_.getConnection();
        StringBuilder builder = threadLocalBuilder_.get()
                .append("delete from ")
                .append(tableName_)
                .append(" where ")
                .append(getPrimaryKey().createStatement())
                .append(" = ?");

        removeStmt = new IndexedPreparedStatement(c.prepareStatement(builder.toString()));
      }

      // TODO: add support for non-numbers
      //removeStmt.setLong(((Number) o.getProperty("id")).longValue());
      removeStmt.setObject(obj.getProperty(getPrimaryKey().getName()));

      int removed = removeStmt.executeUpdate();
      if ( removed == 0 ) {
        // throw new SQLException("Error while removing.");
        // According to doc, no error when removing doesn't remove anything
        return null;
      }

      return obj;
    } catch ( Throwable e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
      return null;
    } finally {
      try {
        removeStmt.setObject(null);
      } catch (SQLException e) {
        Logger logger = (Logger) x.get("logger");
        logger.error(e);
      }
      closeAllQuietly(null, removeStmt);
    }
  }

  public AbstractJDBCDAO(X x, ClassInfo of) throws java.sql.SQLException, ClassNotFoundException {
    setX(x);
    setOf(of);

    JDBCPooledDataSource jp = (JDBCPooledDataSource) x.get("JDBCDataSource");

    dataSource_ = jp.getDataSource();

    tableName_ = of.getObjClass().getSimpleName().toLowerCase();

    buildPropertyList(of);

    maybeCreateTable(x, of);

  }

  /**
   * Builds list of properties of a metaclass
   * @param of ClassInfo
   */
  protected void buildPropertyList(ClassInfo of){

    if ( properties_ == null ) {
      List<PropertyInfo> allProperties = of.getAxiomsByClass(PropertyInfo.class);
      properties_ = new ArrayList<PropertyInfo>();
      for ( PropertyInfo prop : allProperties ) {
        if ( prop.getStorageTransient() )
          continue;
        if ( "".equals(prop.getSQLType()) )
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
      try { resultSet.close(); } catch ( Throwable ignored ) {}
    if ( stmt != null )
      try { stmt.close(); } catch ( Throwable ignored ) {}
  }

  /**
   * Prepare the formatted column names. Appends column names like: (c1,c2,c3)
   * @param builder builder to append to
   */
  public void buildFormattedColumnNames(FObject obj, StringBuilder builder) {
    // collect columns list into comma delimited string
    builder.append('(');
    Iterator i = properties_.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
/*       if ( "id".equals(prop.getName()) )
        continue; */

      builder.append(prop.createStatement());
      if ( i.hasNext() ) {
        builder.append(',');
      }
    }
    builder.append(')');
  }

  /**
   * Prepare the formatted value placeholders. Appends value placeholders like: (?,?,?)
   * @param builder builder to append to
   */
  public void buildFormattedColumnPlaceholders(FObject obj, StringBuilder builder) {
    // map columns into ? and collect into comma delimited string
    builder.append('(');
    Iterator i = properties_.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
/*       if ( "id".equals(prop.getName()) )
        continue; */

      builder.append('?');
      if ( i.hasNext() ) {
        builder.append(',');
      }
    }
    builder.append(')');
  }

  /**
   * Prepare the formatted UPDATE string like :  description='etc', name='etc'
   * @param builder builder to append to
   */
  public void buildUpdateFormattedColumnNames(FObject obj, StringBuilder builder) {
    // collect columns list into comma delimited string
    Iterator i = properties_.iterator();
    while ( i.hasNext() ) {

      PropertyInfo prop = (PropertyInfo) i.next();
      if ( "id".equals(prop.getName()) )
        continue;

      builder.append(prop.createStatement());
      builder.append("='");
      builder.append(prop.get(obj));  //add the new property value
      builder.append('\'');
      if ( i.hasNext() ) {
        builder.append(',');
      }
    }

  }

  /**
   * Create the table in the database and return true if it doesn't already exist otherwise it does nothing and returns false
   * @param of ClassInfo
   */
  public boolean maybeCreateTable(X x, ClassInfo of) {
    Connection c = null;
    IndexedPreparedStatement stmt = null;
    ResultSet resultSet = null;

    try {
      c = dataSource_.getConnection();
      DatabaseMetaData meta = c.getMetaData();
      resultSet = meta.getTables(null, null, tableName_, new String[]{"TABLE"});
      if ( resultSet.isBeforeFirst() ) {
        // found a table, don't create
        return false;
      }

      StringBuilder builder = threadLocalBuilder_.get()
              .append("CREATE TABLE ")
              .append(tableName_)
              .append('(')
              .append(getPrimaryKey().createStatement())
              .append(' ')
              .append(getPrimaryKey().getSQLType())
              .append(" primary key,");

      Iterator i = properties_.iterator();
      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();

        // Why you skip the primary key? (Ask Kevin)
        if ( getPrimaryKey().getName().equals(prop.getName()) )
          continue;

        builder.append(prop.createStatement())
                .append(' ')
                .append(prop.getSQLType()); // TODO: is getSQLType guaranteed to return something?

        if ( i.hasNext() ) {
          builder.append(',');
        }
      }
      builder.append(')');

      // execute statement
      stmt = new IndexedPreparedStatement(c.prepareStatement(builder.toString()));
      stmt.executeUpdate();
      return true;
    } catch ( Throwable e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
      return false;
    } finally {
      closeAllQuietly(resultSet, stmt);
    }
  }

}
