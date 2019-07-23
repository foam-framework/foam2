/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.jdbc',
  name: 'TestDataForJDBC',
  ids: ['id'],
  properties: [
    {
      class: 'Int',
      name: 'id',
      sqlType: 'int'
    },
    {
      class: 'String',
      name: 'name',
      sqlType: 'VARCHAR(40)'
    }
  ]
});
