/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  refines: 'foam.oao.OAO',

  methods: [
    {
      name: 'get',
      javaReturns: 'foam.core.FObject',
      javaThrows: ['java.lang.IllegalAccessException'],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ]
    },
    {
      name: 'setProperty',
      javaReturns: 'void',
      javaThrows: ['java.lang.IllegalAccessException'],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'name',
          javaType: 'String'
        },
        {
          name: 'value',
          javaType: 'Object'
        }
      ]
    },
    {
      name: 'setProperties',
      javaReturns: 'void',
      javaThrows: ['java.lang.IllegalAccessException'],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'values',
          javaType: 'java.util.Map'
        }
      ]
    }
  ]
});
