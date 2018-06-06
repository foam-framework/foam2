/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  refines: 'foam.dao.Journal',

  methods: [
    {
      name: 'replay',
      javaReturns: 'void',
      args: [
        {
          name: 'dao',
          javaType: 'foam.dao.DAO'
        }
      ]
    }
  ]
});
