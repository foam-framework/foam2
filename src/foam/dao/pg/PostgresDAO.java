/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.pg;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.AbstractDAO;
import foam.dao.ListSink;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import java.sql.*;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class PostgresDAO
  extends AbstractDAO
{
  protected ConnectionPool connectionPool = new ConnectionPool();
  protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  protected String table_;
  protected List<PropertyInfo> props_ = new ArrayList<>();

  public PostgresDAO(X x, ClassInfo of) throws SQLException {
    setX(x);
    setOf(of);

    // fetch connection pool from context
    connectionPool = (ConnectionPool) getX().get("connectionPool");

    // load columns and sql types
    List<PropertyInfo> props = of.getAxiomsByClass(PropertyInfo.class);
    for ( PropertyInfo prop : props ) {
      if ( prop.getStorageTransient() )
        continue;
      if ( "".equals(prop.getSQLType()) )
        continue;
      props_.add(prop);
    }

    table_ = of.getObjClass().getSimpleName().toLowerCase();
    if ( ! createTable() ) {
      //throw new SQLException("Error creating table");
    }
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    sink = prepareSink(sink);

    Connection               c         = null;
    IndexedPreparedStatement stmt      = null;
    ResultSet                resultSet = null;

    try {
      c = connectionPool.getConnection();

      StringBuilder builder = sb.get()
          .append("select * from ")
          .append(table_);

      if ( predicate != null ) {
        builder.append(" where ")
            .append(predicate.createStatement());
      }

      if ( order != null ) {
        builder.append(" order by ")
            .append(order.createStatement());
      }

      if ( limit > 0 && limit < this.MAX_SAFE_INTEGER ) {
        builder.append(" limit ").append(limit);
      }

      if ( skip > 0 && skip < this.MAX_SAFE_INTEGER ) {
        builder.append(" offset ").append(skip);
      }

      stmt = new IndexedPreparedStatement(c.prepareStatement(builder.toString()));

      if ( predicate != null ) {
        predicate.prepareStatement(stmt);
      }

      resultSet = stmt.executeQuery();
      while ( resultSet.next() ) {
        sink.put(createFObject(resultSet), null);
      }

      return sink;
    } catch (Throwable e) {
      e.printStackTrace();
      return null;
    } finally {
      closeAllQuietly(resultSet, stmt, c);
    }
  }

  @Override
  public FObject remove_(X x, FObject o) {
    Connection c = null;
    IndexedPreparedStatement stmt = null;

    try {
      c = connectionPool.getConnection();
      StringBuilder builder = sb.get()
          .append("delete from ")
          .append(table_)
          .append(" where ")
          .append(getPrimaryKey().createStatement())
          .append(" = ?");

      stmt = new IndexedPreparedStatement(c.prepareStatement(builder.toString()));
      // TODO: add support for non-numbers
      //stmt.setLong(((Number) o.getProperty("id")).longValue());
      stmt.setObject(o.getProperty(getPrimaryKey().getName()));

      int removed = stmt.executeUpdate();
      if ( removed == 0 ) {
        throw new SQLException("Error while removing.");
      }

      return o;
    } catch (Throwable e) {
      e.printStackTrace();
      return null;
    } finally {
      closeAllQuietly(null, stmt, c);
    }
  }

  @Override
  public FObject find_(X x, Object o) {
    Connection c = null;
    IndexedPreparedStatement stmt = null;
    ResultSet resultSet = null;

    try {
      c = connectionPool.getConnection();
      StringBuilder builder = sb.get()
          .append("select * from ")
          .append(table_)
          .append(" where ")
          .append(getPrimaryKey().createStatement())
          .append(" = ?");

      stmt = new IndexedPreparedStatement(c.prepareStatement(builder.toString()));
      // TODO: add support for non-numbers
      //stmt.setLong(((Number) o).longValue());
      stmt.setObject(o);
      resultSet = stmt.executeQuery();
      if ( ! resultSet.next() ) {
        // no rows
        return null;
      }

      return createFObject(resultSet);
    } catch (Throwable e) {
      e.printStackTrace();
      return null;
    } finally {
      closeAllQuietly(resultSet, stmt, c);
    }
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    throw new UnsupportedOperationException("Unsupported operation: removeAll_");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Connection c = null;
    IndexedPreparedStatement stmt = null;
    ResultSet resultSet = null;

    try {
      c = connectionPool.getConnection();
      StringBuilder builder = sb.get()
          .append("insert into ")
          .append(table_);

      buildFormattedColumnNames(obj, builder);
      builder.append(" values");
      buildFormattedColumnPlaceholders(obj, builder);
      builder.append(" on conflict (")
             .append(getPrimaryKey().createStatement())
             .append(") do update set");
      buildFormattedColumnNames(obj, builder);
      builder.append(" = ");
      buildFormattedColumnPlaceholders(obj, builder);

      stmt = new IndexedPreparedStatement(c.prepareStatement(builder.toString(),
          Statement.RETURN_GENERATED_KEYS));
      // set statement values twice: once for the insert and once for the update on conflict
      setStatementValues(stmt, obj);
      setStatementValues(stmt, obj);

      int inserted = stmt.executeUpdate();
      if ( inserted == 0 ) {
        throw new SQLException("Error performing put_ command");
      }

      // get auto-generated postgres keys
/*       resultSet = stmt.getGeneratedKeys();
      if ( resultSet.next() ) {
        obj.setProperty(getPrimaryKey().getName(), resultSet.getObject(1));
      } */

      return obj;
    } catch (Throwable e) {
      e.printStackTrace();
      return null;
    } finally {
      closeAllQuietly(resultSet, stmt, c);
    }
  }

  /**
   * Creates a table if one does not exist already
   * @throws SQLException
   */
  public boolean createTable() {
    Connection c = null;
    IndexedPreparedStatement stmt = null;
    ResultSet resultSet = null;

    try {
      c = connectionPool.getConnection();
      DatabaseMetaData meta = c.getMetaData();
      resultSet = meta.getTables(null, null, table_, new String[]{"TABLE"});
      if ( resultSet.isBeforeFirst() ) {
        // found a table, don't create
        return false;
      }

      StringBuilder builder = sb.get()
          .append("CREATE TABLE ")
          .append(table_)
          .append("(")
          .append(getPrimaryKey().createStatement())
          .append(" ")
          .append(getPrimaryKey().getSQLType())
          .append(" primary key,");

      Iterator i = props_.iterator();
      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        if ( getPrimaryKey().getName().equals(prop.getName()) )
          continue;

        builder.append(prop.createStatement())
            .append(" ")
            .append(prop.getSQLType());

        if ( i.hasNext() ) {
          builder.append(",");
        }
      }
      builder.append(")");

      // execute statement
      stmt = new IndexedPreparedStatement(c.prepareStatement(builder.toString()));
      stmt.executeUpdate();
      return true;
    } catch (Throwable e) {
      e.printStackTrace();
      return false;
    } finally {
      closeAllQuietly(resultSet, stmt, c);
    }
  }

  /**
   * maps a database result row to an FObject
   *
   * @param resultSet
   * @return FObject
   * @throws SQLException
   */
  private FObject createFObject(ResultSet resultSet) throws Exception {
    if ( getOf() == null ) {
      throw new Exception("`Of` is not set");
    }

    FObject obj = (FObject) getOf().getObjClass().newInstance();
    ResultSetMetaData metaData = resultSet.getMetaData();

    int index = 1;
    Iterator i = props_.iterator();
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
   * Prepare the formatted column names. Appends column names like: (c1,c2,c3)
   * @param builder builder to append to
   */
  public void buildFormattedColumnNames(FObject obj, StringBuilder builder) {
    // collect columns list into comma delimited string
    builder.append("(");
    Iterator i = props_.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
/*       if ( "id".equals(prop.getName()) )
        continue; */

      builder.append(prop.createStatement());
      if ( i.hasNext() ) {
        builder.append(",");
      }
    }
    builder.append(")");
  }

  /**
   * Prepare the formatted value placeholders. Appends value placeholders like: (?,?,?)
   * @param builder builder to append to
   */
  public void buildFormattedColumnPlaceholders(FObject obj, StringBuilder builder) {
    // map columns into ? and collect into comma delimited string
    builder.append("(");
    Iterator i = props_.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
/*       if ( "id".equals(prop.getName()) )
        continue; */

      builder.append("?");
      if ( i.hasNext() ) {
        builder.append(",");
      }
    }
    builder.append(")");
  }

  /**
   * Sets the value of the PrepareStatement
   * @param stmt statement to set values
   * @param obj object to get values from
   * @return the updated index
   * @throws SQLException
   */
  public void setStatementValues(IndexedPreparedStatement stmt, FObject obj) throws SQLException {
    Iterator i = props_.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      prop.setStatementValue(stmt, obj);
    }
  }

  /**
   * Closes resources without throwing exceptions
   * @param resultSet ResultSet
   * @param stmt IndexedPreparedStatement
   * @param c Connection
   */
  public void closeAllQuietly(ResultSet resultSet, IndexedPreparedStatement stmt, Connection c) {
    if ( resultSet != null )
      try { resultSet.close(); } catch (Throwable ignored) {}
    if ( stmt != null )
      try { stmt.close(); } catch (Throwable ignored) {}
    if ( c != null )
      try { c.close(); } catch (Throwable ignored) {}
  }
}
