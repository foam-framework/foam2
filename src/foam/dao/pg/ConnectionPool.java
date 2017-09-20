package foam.dao.pg;

import org.apache.commons.dbcp2.BasicDataSource;

import java.sql.Connection;
import java.sql.SQLException;

public abstract class ConnectionPool {

  protected static String base = "jdbc:postgresql://";
  // TODO(drish) get an accurate number for pool size.
  protected static int poolSize = 4;
  protected static BasicDataSource pool;

  public static void setup(String host, String port, String dbName, String username, String password) {
    String url =  base + host + ":" + port + "/" + dbName;

    try {
      pool = new BasicDataSource();
      pool.setUsername(username);
      pool.setDriverClassName("org.postgresql.Driver");
      pool.setUrl(url);
      pool.setInitialSize(poolSize);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public static Connection getConnection() throws SQLException {
    return pool.getConnection();
  }
}