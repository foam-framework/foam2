package foam.dao;

import org.apache.commons.dbcp2.BasicDataSource;

import java.sql.Connection;
import java.sql.SQLException;

public abstract class PgConnectionPool {

    // TODO(drish) get this data from env or configuration file
    protected static String url = "jdbc:postgresql://localhost:5432/postgres";
    protected static String username = "postgres";
    protected static int poolSize = 4;

    protected static BasicDataSource pool;

    public static void setup() {
        pool = new BasicDataSource();
        pool.setUsername(username);
        pool.setDriverClassName("org.postgresql.Driver");
        pool.setUrl(url);
        pool.setInitialSize(poolSize);
    }

    public static Connection getConnection() throws SQLException {
        return pool.getConnection();
    }
}
