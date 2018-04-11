/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.http',
  name: 'HttpParameters',

  documentation: '',

  methods: [
    {
      name: 'setX',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ]
    },
    {
      name: 'getX',
      javaReturns: 'foam.core.X'
    },
    {
      name: 'set',
      args: [
        {
          name: 'name',
          documentation: 'Return single value for named parameter, or null if not found.',
          javaType: 'String'
        },
        {
          name: 'value',
          javaType: 'Object'
        }
      ]
    },
    {
      name: 'get',
      args: [
        {
          name: 'name',
          documentation: 'Return single value for named parameter, or null if not found.',
          javaType: 'String'
        }
      ],
      javaReturns: 'Object'
    },
    {
      name: 'getParameter',
      args: [
        {
          name: 'name',
          documentation: 'Return single value for named parameter, or null if not found.',
          javaType: 'String'
        }
      ],
      javaReturns: 'String'
    },
    {
      name: 'getParameterValues',
      args: [
        {
          name: 'name',
          documentation: 'Return array of vales for named parameter, or null if not found.',
          javaType: 'String'
        }
      ],
      javaReturns: 'String[]'
    }
  ]
});
