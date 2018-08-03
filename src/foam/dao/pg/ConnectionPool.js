/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.pg',
  name: 'ConnectionPool',

  documentation: 'Represents a database connection pool',

  implements: [ 'foam.nanos.NanoService' ],

  javaImports: [ 'org.apache.commons.dbcp2.BasicDataSource' ],

  properties: [
    {
      class: 'Object',
      name: 'pool',
      javaType: 'BasicDataSource',
      documentation: 'Connection pool',
    },
    {
      class: 'Int',
      name: 'poolSize',
      value: 20,
      documentation: 'Connection pool size'
    },
    {
      class: 'String',
      name: 'driver',
      documentation: 'Database driver'
    },
    {
      class: 'String',
      name: 'prefix',
      documentation: 'Database connection string prefix. i.e. jdbc:postgresq://'
    },
    {
      class: 'String',
      name: 'hostname',
      documentation: 'Database hostname'
    },
    {
      class: 'String',
      name: 'port',
      documentation: 'Database port'
    },
    {
      class: 'String',
      name: 'database',
      documentation: 'Database name'
    },
    {
      class: 'String',
      name: 'username',
      documentation: 'Database username for authentication'
    },
    {
      class: 'String',
      name: 'password',
      documentation: 'Database password for authentication'
    },
    {
      class: 'String',
      name: 'connectionString',
      transient: true,
      javaFactory: `return getPrefix() +
        getHostname() + ":" +
        getPort() + "/" +
        getDatabase();`
    }
  ],

  methods: [
    {
      name: 'start',
      javaReturns: 'void',
      javaCode: `try {
  BasicDataSource pool = new BasicDataSource();
  pool.setUsername(getUsername());
  pool.setDriverClassName(getDriver());
  pool.setUrl(getConnectionString());
  pool.setInitialSize(getPoolSize());
  setPool(pool);
} catch (Exception e) {
  e.printStackTrace();
}`
    },
    {
      name: 'getConnection',
      javaReturns: 'java.sql.Connection',
      javaThrows: ['java.sql.SQLException'],
      javaCode: 'return getPool().getConnection();'
    }
  ]
});
