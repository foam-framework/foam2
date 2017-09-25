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
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

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

  protected final String table;
  protected final List<PropertyInfo> props;

  public PostgresDAO(X x, ClassInfo of) throws SQLException {
    setX(x);
    setOf(of);

    // fetch connection pool from context
    connectionPool = (ConnectionPool) getX().get("connectionPool");

    // load columns and sql types
    table = of.getObjClass().getSimpleName().toLowerCase();
    if ( ! createTable(of) ) {
      throw new SQLException("Error creating table");
    }

    props = ((List<PropertyInfo>) of.getAxiomsByClass(PropertyInfo.class))
        .stream().filter(e -> ! e.getStorageTransient())
        .collect(Collectors.toList());
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( sink == null ) {
      sink = new ListSink();
    }

    Connection c = null;
    PreparedStatement stmt = null;
    ResultSet resultSet = null;

    try {
      c = connectionPool.getConnection();

      // select all if predicate is null, else use predicate
      if ( predicate == null ) {
        StringBuilder builder = sb.get()
            .append("select * from ")
            .append(table);
        stmt = c.prepareStatement(builder.toString());
      } else {
        stmt = c.prepareStatement(predicate.createStatement(table));
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
    PreparedStatement stmt = null;

    try {
      c = connectionPool.getConnection();
      StringBuilder builder = sb.get()
          .append("delete from ")
          .append(table)
          .append(" where id = ?");

      stmt = c.prepareStatement(builder.toString());
      // TODO: add support for non-numbers
      stmt.setLong(1, ((Number) o.getProperty("id")).longValue());

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
    PreparedStatement stmt = null;
    ResultSet resultSet = null;

    try {
      c = connectionPool.getConnection();
      StringBuilder builder = sb.get()
          .append("select * from ")
          .append(table)
          .append(" where id = ?");

      stmt = c.prepareStatement(builder.toString());
      // TODO: add support for non-numbers
      stmt.setLong(1, ((Number) o).longValue());
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
    PreparedStatement stmt = null;
    ResultSet resultSet = null;

    try {
      c = connectionPool.getConnection();
      StringBuilder builder = sb.get()
          .append("insert into ")
          .append(table);

      buildFormattedColumnNames(obj, builder);
      builder.append(" values");
      buildFormattedColumnPlaceholders(obj, builder);
      builder.append(" on conflict (id) do update set");
      buildFormattedColumnNames(obj, builder);
      builder.append(" = ");
      buildFormattedColumnPlaceholders(obj, builder);

      int index = 1;
      stmt = c.prepareStatement(builder.toString(),
          Statement.RETURN_GENERATED_KEYS);
      // set statement values twice: once for the insert and once for the update on conflict
      index = setStatementValues(index, stmt, obj);
      index = setStatementValues(index, stmt, obj);

      int inserted = stmt.executeUpdate();
      if ( inserted == 0 ) {
        throw new SQLException("Error performing put_ command");
      }

      // get auto-generated postgres keys
      resultSet = stmt.getGeneratedKeys();
      if ( resultSet.next() ) {
        obj.setProperty("id", resultSet.getLong(1));
      }

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
  public boolean createTable(ClassInfo classInfo) {
    Connection c = null;
    PreparedStatement stmt = null;
    ResultSet resultSet = null;

    try {
      c = connectionPool.getConnection();
      DatabaseMetaData meta = c.getMetaData();
      resultSet = meta.getTables(null, null, table, new String[]{"TABLE"});
      if ( resultSet.isBeforeFirst() ) {
        // found a table, don't create
        return false;
      }

      String columns = props.stream()
          .filter(e -> !"id".equals(e.getName()))
          .map(e -> e.getName() + " " + e.getSQLType())
          .collect(Collectors.joining(","));

      StringBuilder builder = sb.get()
          .append("CREATE TABLE ")
          .append(table)
          .append("(id bigserial primary key,")
          .append(columns)
          .append(")");

      // execute statement
      stmt = c.prepareStatement(builder.toString());
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
    Iterator i = props.iterator();
    while ( i.hasNext() ) {
      // prevent reading out of bounds of result set
      if ( index > metaData.getColumnCount() )
        break;
      // get the property and set the value
      PropertyInfo prop = (PropertyInfo) i.next();
      prop.set(obj, resultSet.getObject(index++));
    }

    return obj;
  }

  /**
   * Prepare the formatted column names. Appends column names like: (c1,c2,c3)
   * @param builder builder to append to
   */
  public void buildFormattedColumnNames(FObject obj, StringBuilder builder) {
    // collect columns list into comma delimited string
    String columns = props.stream()
        .filter(e -> ! "id".equals(e.getName()))
        .map(e -> e.getName().toLowerCase())
        .collect(Collectors.joining(","));

    builder.append("(")
        .append(columns)
        .append(")");
  }

  /**
   * Prepare the formatted value placeholders. Appends value placeholders like: (?,?,?)
   * @param builder builder to append to
   */
  public void buildFormattedColumnPlaceholders(FObject obj, StringBuilder builder) {
    // map columns into ? and collect into comma delimited string
    String placeholders = props.stream()
        .filter(e -> ! "id".equals(e.getName()))
        .map(String -> "?")
        .collect(Collectors.joining(","));

    builder.append("(")
        .append(placeholders)
        .append(")");
  }

  /**
   * Sets the value of the PrepareStatement
   * @param index index to start from
   * @param stmt statement to set values
   * @param obj object to get values from
   * @return the updated index
   * @throws SQLException
   */
  public int setStatementValues(int index, PreparedStatement stmt, FObject obj) throws SQLException {
    Iterator i = props.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      if ( prop.getName().equals("id") )
        continue;
      stmt.setObject(index++, prop.get(obj));
    }
    return index;
  }

  /**
   * Closes resources without throwing exceptions
   * @param resultSet ResultSet
   * @param stmt PreparedStatement
   * @param c Connection
   */
  public void closeAllQuietly(ResultSet resultSet, PreparedStatement stmt, Connection c) {
    if ( resultSet != null )
      try { resultSet.close(); } catch (Throwable ignored) {}
    if ( stmt != null )
      try { stmt.close(); } catch (Throwable ignored) {}
    if ( c != null )
      try { c.close(); } catch (Throwable ignored) {}
  }
}