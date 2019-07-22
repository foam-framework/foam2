/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/* A JDBC Connection Specification to add to the system context */
foam.CLASS({
  package: 'foam.dao',
  name: 'JDBCConnectionSpec',
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
      class: 'String',
      name: 'userPassword'
    }
  ]
});
