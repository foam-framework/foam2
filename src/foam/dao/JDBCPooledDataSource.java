/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.X;
import org.apache.commons.dbcp2.*;
import org.apache.commons.pool2.ObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPool;

import javax.sql.DataSource;
import java.sql.DriverManager;

public class JDBCPooledDataSource {

  protected static String SQL_POOL_NAME = "SQLPool";

  // Holds a reference to the connection pool ( .getConnection() )
  protected static DataSource dataSource_;

  private JDBCPooledDataSource(){
    // Nothing
  }

  public static DataSource getDataSource(X x) throws ClassNotFoundException, java.sql.SQLException{
    try {
      if(dataSource_ == null){
        //Add code to get JDBCConnectionSpec properties
        Object spec = x.get("JDBCConnectionSpec");

        if(spec == null) {
          throw new java.sql.SQLException("JDBC connection information not found");
        }

        if ( !(spec instanceof JDBCConnectionSpec) ) {
          throw new ClassCastException("Expecting a JDBCConnectionSpec but obtained instead: " + spec.toString());
        }

        JDBCConnectionSpec jdbcSpec = (JDBCConnectionSpec) spec;

        //jdbc:mysql://localhost/db?useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=UTC
        String connectionURI = "jdbc:" + jdbcSpec.getDatabaseServer() + "://" + jdbcSpec.getHostName() +
          "/" + jdbcSpec.getDatabaseName() + "?useUnicode=true&useJDBCCompliantTimezoneShift=true" +
          "&useLegacyDatetimeCode=false&serverTimezone=UTC" +
          "&user=" + jdbcSpec.getUserName() + "&password=" + jdbcSpec.getUserPassword();
        dataSource_ = JDBCPooledDataSource.setupPoolingDataSource(connectionURI);
      }
    } catch (ClassNotFoundException e) {
      throw e;
    } catch (java.sql.SQLException e) {
      throw e;
    }
    return dataSource_;
  }

  /**
   * Sets up the pool of connections the first time this class is instantiated.
   */
  private static DataSource setupPoolingDataSource(String connectionURI) throws ClassNotFoundException, java.sql.SQLException{

    ConnectionFactory connectionFactory = new DriverManagerConnectionFactory(connectionURI, null);

    PoolableConnectionFactory poolableConnectionFactory = new PoolableConnectionFactory(connectionFactory, null);

    ObjectPool<PoolableConnection> connectionPool = new GenericObjectPool<>(poolableConnectionFactory);

    poolableConnectionFactory.setPool(connectionPool);

    Class.forName("org.apache.commons.dbcp2.PoolingDriver");

    PoolingDriver driver = (PoolingDriver) DriverManager.getDriver("jdbc:apache:commons:dbcp:");

    driver.registerPool(SQL_POOL_NAME, connectionPool);

    PoolingDataSource<PoolableConnection> dataSource = new PoolingDataSource<>(connectionPool);

    return dataSource;

  }

  /**
   * Shuts down the pool of connections. This method should be executed once the application wants to exit.
   * Warning: Should never be used from inside this class.
   */
  public static void shutDownPool() {
    try {
      PoolingDriver driver = (PoolingDriver) DriverManager.getDriver("jdbc:apache:commons:dbcp:");
      driver.closePool(SQL_POOL_NAME);
    } catch (java.sql.SQLException e) {
      //Do Nothing
    }
  }
}
