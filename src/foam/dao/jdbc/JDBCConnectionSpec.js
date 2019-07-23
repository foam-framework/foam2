/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.jdbc',
  name: 'JDBCConnectionSpec',
  documentation: 'A JDBC Connection Specification to add to the system context.',
  constants: [
    {
      class: 'String',
      name: 'databaseServer'
    },
    {
      class: 'String',
      name: 'hostName'
    },
    {
      class: 'String',
      name: 'databaseName'
    },
    {
      class: 'String',
      name: 'userName'
    },
    {
      class: 'Password',
      name: 'userPassword'
    }
  ]
});
