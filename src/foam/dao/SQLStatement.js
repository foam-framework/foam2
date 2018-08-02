/**
  * @license
  * Copyright 2017 The FOAM Authors. All Rights Reserved.
  * http://www.apache.org/licenses/LICENSE-2.0
  */

foam.INTERFACE({
  package: 'foam.dao',
  name: 'SQLStatement',

  methods: [
    {
      name: 'createStatement',
      javaReturns: 'String'
    },
    {
      name: 'prepareStatement',
      javaReturns: 'void',
      javaThrows: ['java.sql.SQLException'],
      args: [
        {
          name: 'stmt',
          javaType: 'foam.dao.pg.IndexedPreparedStatement'
        }
      ]
    }
  ]
});
