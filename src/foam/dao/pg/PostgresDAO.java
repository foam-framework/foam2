package foam.dao.pg;

import foam.core.*;
import foam.dao.*;
import java.sql.*;

import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

public class PostgresDAO
    extends AbstractDAO
{

  public PostgresDAO(String host, String port, String dbName, String username, String password) {

    if ( dbName == null || username == null ) {
      throw new IllegalArgumentException("Illegal arguments");
    }

    host = (host != null) ? host : "localhost";
    port = (port != null) ? port : "5432";

    ConnectionPool.setup(host, port, dbName, username, password);
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {

    if ( sink == null ) {
      sink = new ListSink();
    }

    try {

      String table = getOf().getObjClass().getSimpleName().toLowerCase();
      Connection c = ConnectionPool.getConnection();

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
      SQLData data = new SQLData(o);
      Connection c = ConnectionPool.getConnection();

      PreparedStatement smt = c.prepareStatement(data.createDeleteStatement());

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

      String tableName = getOf().getObjClass().getSimpleName().toLowerCase();
      Connection c = ConnectionPool.getConnection();

      String sql = "select * from " + tableName;
      sql += " where id = ?";

      PreparedStatement smt = c.prepareStatement(sql);
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
      Connection c = ConnectionPool.getConnection();

      // updating existing one
      // when FObject isIdSet is null it returns 0 , is it ok ?
      if ( (Long)obj.getProperty("id") != 0 ) {
        SQLData data = new SQLData(obj);
        PreparedStatement smt = c.prepareStatement(data.createUpdateStatement());

        // put data into statement preserving order.
        int i = 1;
        for ( Object value: data.getValues() ) {
          smt.setObject(i, value);
          i++;
        }

        int inserted = smt.executeUpdate();
        if ( inserted == 0 ) {
          throw new SQLException("Error while inserting.");
        }

        smt.close();
        // inserting new one
      } else {
        SQLData data = new SQLData(obj);
        PreparedStatement smt = c.prepareStatement(data.createInsertStatement(),
            Statement.RETURN_GENERATED_KEYS);

        // put data into statement preserving order.
        int i = 1;
        for ( Object key: data.getValues() ) {
          smt.setObject(i, key);
          i++;
        }

        int inserted = smt.executeUpdate();
        if ( inserted == 0 ) {
          throw new SQLException("Error while inserting.");
        }

        // get auto-generated postgres keys
        ResultSet generatedKeys = smt.getGeneratedKeys();
        if ( generatedKeys.next() ) {
          long pgKey = generatedKeys.getLong(1);
          obj.setProperty("id", pgKey);
        } else {
          throw new SQLException("Error while inserting: no ID returned");
        }

        smt.close();
      }

      c.close();
    } catch (Exception e) {
      e.printStackTrace();
    }

    return obj;
  }
}