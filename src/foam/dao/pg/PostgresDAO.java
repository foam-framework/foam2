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
    createTable(of);
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( sink == null ) {
      sink = new ListSink();
    }

    try {
      Connection c = connectionPool.getConnection();
      PreparedStatement stmt = null;

      // select all if predicate is null, else use predicate
      if ( predicate == null ) {
        StringBuilder builder = sb.get()
            .append("select * from ")
            .append(table);
        stmt = c.prepareStatement(builder.toString());
      } else {
        stmt = c.prepareStatement(predicate.createStatement(table));
      }

      ResultSet resultSet = stmt.executeQuery();
      while ( resultSet.next() ) {
        sink.put(createFObject(resultSet), null);
      }

      resultSet.close();
      stmt.close();
      c.close();
    } catch (Exception e) {
      e.printStackTrace();
    }

    return sink;
  }

  @Override
  public FObject remove_(X x, FObject o) {

    try {
      Connection c = connectionPool.getConnection();
      StringBuilder builder = sb.get()
          .append("delete from ")
          .append(table)
          .append(" where id = ?");

      PreparedStatement stmt = c.prepareStatement(builder.toString());
      stmt.setLong(1, ((Long) o.getProperty("id")));

      int removed = stmt.executeUpdate();
      if ( removed == 0 ) {
        throw new SQLException("Error while removing.");
      }

      stmt.close();
      c.close();
      return o;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  @Override
  public FObject find_(X x, Object o) {
    try {
      Connection c = connectionPool.getConnection();
      StringBuilder builder = sb.get()
          .append("select * from ")
          .append(table)
          .append(" where id = ?");

      PreparedStatement stmt = c.prepareStatement(builder.toString());
      stmt.setLong(1, ((Long) o));
      ResultSet resultSet = stmt.executeQuery();
      if ( ! resultSet.isBeforeFirst() ) {
        // no rows found
        return null;
      }

      FObject result = createFObject(resultSet);

      resultSet.close();
      stmt.close();
      c.close();

      return result;
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    throw new UnsupportedOperationException("Unsupported operation: removeAll_");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    try {
      Connection c = connectionPool.getConnection();
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
      builder.append(" where id = ?");

      int index = 1;
      PreparedStatement stmt = c.prepareStatement(builder.toString(),
          Statement.RETURN_GENERATED_KEYS);
      // set statement values twice: once for the insert and once for the update on conflict
      index = setStatementValues(index, stmt, obj);
      index = setStatementValues(index, stmt, obj);
      // set the object id for the update statement
      stmt.setObject(index, obj.getProperty("id"));

      System.out.println(stmt.toString());

      int inserted = stmt.executeUpdate();
      if (inserted == 0) {
        throw new SQLException("Error performing put_ command");
      }

      // get auto-generated postgres keys
      ResultSet resultSet = stmt.getGeneratedKeys();
      if ( resultSet.next() ) {
        obj.setProperty("id", resultSet.getLong(1));
      }

      resultSet.close();
      stmt.close();
      c.close();
    } catch (SQLException e) {
      e.printStackTrace();
    }

    return obj;
  }

  /**
   * Creates a table if one does not exist already
   * @throws SQLException
   */
  public void createTable(ClassInfo classInfo) throws SQLException {
    Connection conn = connectionPool.getConnection();
    DatabaseMetaData meta = conn.getMetaData();
    ResultSet resultSet = meta.getTables(null, null, table, new String[] { "TABLE" });
    if ( resultSet.isBeforeFirst() ) {
      // found a table, don't create
      return;
    }

    List<PropertyInfo> props = classInfo.getAxiomsByClass(PropertyInfo.class);
    StringBuilder builder = sb.get()
        .append("CREATE TABLE ")
        .append(table)
        .append("(id serial primary key,")
        .append(props.stream().map(e -> {
          // postgresql does support tinyint, use small int instead
          SQLType type = e.getSqlType();
          switch ( type.getName() ) {
            case "TINYINT":
              return e.getName() + " SMALLINT";
            default:
              return e.getName() + " " + type.getName();
          }
        }).collect(Collectors.joining(",")))
        .append(")");

    // execute statement
    PreparedStatement stmt = conn.prepareStatement(builder.toString());
    stmt.executeUpdate();

    resultSet.close();
    stmt.close();
    conn.close();
  }

  /**
   * maps a database result row to an FObject
   *
   * @param row
   * @return FObject
   * @throws SQLException
   */
  private FObject createFObject(ResultSet row) throws Exception {

    if ( getOf() == null ) {
      throw new Exception("`Of` is not set");
    }

    List<PropertyInfo> props = getOf().getAxioms();
    FObject result = (FObject) getOf().getObjClass().newInstance();

    // set fields
    for( int i = 0; i < props.size(); i++ ) {
      String propName = props.get(i).getName();
      Object value = row.getObject(i + 1);
      result.setProperty(propName, value);
    }
    return result;
  }

  /**
   * Prepare the formatted column names. Appends column names like: (c1,c2,c3)
   * @param builder builder to append to
   */
  public void buildFormattedColumnNames(FObject obj, StringBuilder builder) {
    // collect columns list into comma delimited string
    List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    builder.append("(")
        .append(props.stream().map(PropertyInfo::getName).collect(Collectors.joining(",")))
        .append(")");
  }

  /**
   * Prepare the formatted value placeholders. Appends value placeholders like: (?,?,?)
   * @param builder builder to append to
   */
  public void buildFormattedColumnPlaceholders(FObject obj, StringBuilder builder) {
    // map columns into ? and collect into comma delimited string
    List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    builder.append("(")
        .append(props.stream().map(String -> "?").collect(Collectors.joining(",")))
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
    List props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
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