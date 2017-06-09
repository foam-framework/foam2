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
    },
    {
      name: 'setProperty',
      javaReturns: 'void',
      args: [
        {
          class: 'String',
          name: 'name',
        },
        {
          class: 'Object',
          name: 'value'
        }
      ]
    },
    {
      name: 'setProperties',
      javaReturns: 'void',
      args: [
        {
          class: 'Map',
          name: 'values'
        }
      ]
    }
  ]
})
