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
import java.util.StringJoiner;
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
  protected final List<String> columns;

  public PostgresDAO(ClassInfo of, String host, String port, String dbName, String username, String password) {
    setOf(of);

    // get table name and columns
    table = of.getObjClass().getSimpleName().toLowerCase();
    List props = of.getAxiomsByClass(PropertyInfo.class);
    columns = new ArrayList<>(props.size());
    Iterator i = props.iterator();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      // ignore id property
      if ( prop.getName().equals("id") )
        continue;
      columns.add(prop.getName());
    }

    if ( dbName == null || username == null ) {
      throw new IllegalArgumentException("Illegal arguments");
    }

    host = (host != null) ? host : "localhost";
    port = (port != null) ? port : "5432";

    connectionPool.setup(host, port, dbName, username, password);
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {

    if ( sink == null ) {
      sink = new ListSink();
    }

    try {

      String table = getOf().getObjClass().getSimpleName().toLowerCase();
      Connection c = connectionPool.getConnection();

      String sql = predicate.createStatement(table);
      PreparedStatement smt = c.prepareStatement(sql);

      predicate.prepareStatement(smt);
      ResultSet rs = smt.executeQuery();

      while ( rs.next() ) sink.put(createFObject(rs), null);

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

      PreparedStatement smt = c.prepareStatement(builder.toString());
      smt.setLong(1, ((Long) o.getProperty("id")));

      int removed = smt.executeUpdate();
      if ( removed == 0 ) {
        throw new SQLException("Error while removing.");
      }
      return o;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
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

  @Override
  public FObject find_(X x, Object o) {

    try {
      Connection c = connectionPool.getConnection();
      StringBuilder builder = sb.get()
          .append("select * from ")
          .append(table)
          .append(" where id = ?");

      PreparedStatement smt = c.prepareStatement(builder.toString());
      smt.setLong(1, ((Long) o));
      ResultSet rs = smt.executeQuery();

      if ( rs.next() ) return createFObject(rs);
      return null;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {}

  @Override
  public FObject put_(X x, FObject obj) {
    try {
      Connection c = connectionPool.getConnection();
      StringBuilder builder = sb.get()
          .append("insert into ")
          .append(table);

      buildFormattedColumnNames(builder);
      builder.append(" values");
      buildFormattedColumnPlaceholders(builder);
      builder.append(" on conflict (id) do update set");
      buildFormattedColumnNames(builder);
      builder.append(" = ");
      buildFormattedColumnPlaceholders(builder);
      builder.append(" where id = ?");

      int index = 1;
      PreparedStatement stmt = c.prepareStatement(builder.toString(),
          Statement.RETURN_GENERATED_KEYS);
      // set statement values twice: once for the insert and once for the update on conflict
      index = setStatementValues(index, stmt, obj);
      index = setStatementValues(index, stmt, obj);
      // set the object id for the update statement
      stmt.setObject(index, obj.getProperty("id"));

      int inserted = stmt.executeUpdate();
      if (inserted == 0) {
        throw new SQLException("Error performing put_ command");
      }

      // get auto-generated postgres keys
      ResultSet keys = stmt.getGeneratedKeys();
      if ( keys.next() ) {
        obj.setProperty("id", keys.getLong(1));
      }

      stmt.close();
      c.close();
    } catch (SQLException e) {
      e.printStackTrace();
    }

    return obj;
  }

  /**
   * Prepare the formatted column names. Appends column names like: (c1,c2,c3)
   * @param builder builder to append to
   */
  public void buildFormattedColumnNames(StringBuilder builder) {
    // collect columns list into comma delimited string
    builder.append("(")
        .append(columns.stream().collect(Collectors.joining(",")))
        .append(")");
  }

  /**
   * Prepare the formatted value placeholders. Appends value placeholders like: (?,?,?)
   * @param builder builder to append to
   */
  public void buildFormattedColumnPlaceholders(StringBuilder builder) {
    // map columns into ? and collect into comma delimited string
    builder.append("(")
        .append(columns.stream().map(String -> "?").collect(Collectors.joining(",")))
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
      stmt.setObject(index++, prop.get(obj));
    }
    return index;
  }
}