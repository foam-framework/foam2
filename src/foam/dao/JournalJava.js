/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  refines: 'foam.dao.Journal',

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'nu',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'old',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'nu',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'remove',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'replay',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'dao',
          javaType: 'foam.dao.DAO'
        }
      ]
    }
  ]
});
