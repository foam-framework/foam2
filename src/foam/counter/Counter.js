/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.counter',
  name: 'Counter',

  properties: [
    {
      class: 'Long',
      name: 'id',
    },
    {
      name: 'name',
      class: 'String',
      documentation: `daoName should match the dao where real object can be found`
    },
    {
      name: 'key',
      class: 'String'
    }
  ]
});
