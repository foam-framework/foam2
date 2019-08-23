/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.jdbc;

import foam.core.X;
import org.apache.commons.dbcp2.*;
import org.apache.commons.pool2.ObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPool;
import foam.nanos.logger.Logger;
import javax.sql.DataSource;
import java.sql.DriverManager;

public class JDBCPooledDataSource {

  // Holds a reference to the connection pool ( .getConnection() )
  protected DataSource dataSource_;

  private static String DEFAULT_POOL_NAME = "DefaultPoolName";

  public JDBCPooledDataSource(X x, String poolName) {
    try {
      Object spec = x.get("JDBCConnectionSpec");

      JDBCConnectionSpec jdbcSpec = (JDBCConnectionSpec) spec;

      String connectionURI = jdbcSpec.buildConnectionURI();

      dataSource_ = setupPoolingDataSource(connectionURI, poolName);
    } catch ( ClassNotFoundException e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
    } catch ( java.sql.SQLException e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
    }
 }

  public JDBCPooledDataSource(X x) {
    try {
      Object spec = x.get("JDBCConnectionSpec");

      JDBCConnectionSpec jdbcSpec = (JDBCConnectionSpec) spec;

      String connectionURI = jdbcSpec.buildConnectionURI();

      dataSource_ = setupPoolingDataSource(connectionURI, DEFAULT_POOL_NAME);
    } catch ( ClassNotFoundException e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
    } catch ( java.sql.SQLException e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
    }
  }

  public DataSource getDataSource() {
    return dataSource_;
  }

  /**
   * Sets up the pool of connections the first time this class is instantiated.
   */
  private DataSource setupPoolingDataSource(String connectionURI, String poolName) throws ClassNotFoundException, java.sql.SQLException{

    ConnectionFactory connectionFactory = new DriverManagerConnectionFactory(connectionURI, null);

    PoolableConnectionFactory poolableConnectionFactory = new PoolableConnectionFactory(connectionFactory, null);

    ObjectPool<PoolableConnection> connectionPool = new GenericObjectPool<>(poolableConnectionFactory);

    poolableConnectionFactory.setPool(connectionPool);

    Class.forName("org.apache.commons.dbcp2.PoolingDriver");

    PoolingDriver driver = (PoolingDriver) DriverManager.getDriver("jdbc:apache:commons:dbcp:");

    driver.registerPool(poolName, connectionPool);

    PoolingDataSource<PoolableConnection> dataSource = new PoolingDataSource<>(connectionPool);

    return dataSource;
  }

  /**
   * Shuts down the pool of connections. This method should be executed once the application wants to exit.
   * Warning: Should never be used from inside this class.
   */
  public void shutDownPool(String poolName) {
    try {
      PoolingDriver driver = (PoolingDriver) DriverManager.getDriver("jdbc:apache:commons:dbcp:");
      driver.closePool(poolName);
    } catch ( java.sql.SQLException e ) {
      //Do Nothing
    }
  }
}
