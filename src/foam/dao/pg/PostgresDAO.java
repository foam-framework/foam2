package foam.dao.pg;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.AbstractDAO;
import foam.dao.ListSink;
import foam.dao.SQLType;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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

  public PostgresDAO(ClassInfo of, String host, String port, String dbName, String username, String password) throws SQLException {
    setOf(of);

    if ( dbName == null || username == null ) {
      throw new IllegalArgumentException("Illegal arguments");
    }

    host = (host != null) ? host : "localhost";
    port = (port != null) ? port : "5432";

    // set up connection pool
    connectionPool.setup(host, port, dbName, username, password);

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
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    } finally {
      if ( resultSet != null )
        try { resultSet.close(); } catch (SQLException ignored) {}
      if ( stmt != null )
        try { stmt.close(); } catch (SQLException ignored) {}
      if ( c != null )
        try { c.close(); } catch (SQLException ignored) {}
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
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    } finally {
      if ( stmt != null )
        try { stmt.close(); } catch (SQLException ignored) {}
      if ( c != null )
        try { c.close(); } catch (SQLException ignored) {}
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
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    } finally {
      if ( resultSet != null )
        try { resultSet.close(); } catch (SQLException ignored) {}
      if ( stmt != null )
        try { stmt.close(); } catch (SQLException ignored) {}
      if ( c != null )
        try { c.close(); } catch (SQLException ignored) {}
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
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    } finally {
      if ( resultSet != null )
        try { resultSet.close(); } catch (SQLException ignored) {}
      if ( stmt != null )
        try { stmt.close(); } catch (SQLException ignored) {}
      if ( c != null )
        try { c.close(); } catch (SQLException ignored) {}
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
          .map(e -> {
            // map types to postgres types
            SQLType type = e.getSqlType();
            switch (type.getName()) {
              case "TINYINT":
                return e.getName() + " SMALLINT";
              case "VARBINARY":
                return e.getName() + " BYTEA";
              default:
                return e.getName() + " " + type.getName();
            }
          })
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
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    } finally {
      if ( resultSet != null )
        try { resultSet.close(); } catch (SQLException ignored) {}
      if ( stmt != null )
        try { stmt.close(); } catch (SQLException ignored) {}
      if ( c != null )
        try { c.close(); } catch (SQLException ignored) {}
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
      stmt.setObject(index++, prop.get(obj), prop.getSqlType().getOrdinal());
    }
    return index;
  }
}