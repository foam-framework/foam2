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
          type: 'Context'
        }
      ]
    },
    {
      name: 'getX',
      type: 'Context'
    },
    {
      name: 'set',
      args: [
        {
          name: 'name',
          documentation: 'Return single value for named parameter, or null if not found.',
          type: 'Any'
        },
        {
          name: 'value',
          type: 'Any'
        }
      ]
    },
    {
      name: 'get',
      args: [
        {
          name: 'name',
          documentation: 'Return single value for named parameter, or null if not found.',
          type: 'Any'
        }
      ],
      type: 'Any'
    },
    {
      name: 'getParameter',
      args: [
        {
          name: 'name',
          documentation: 'Return single value for named parameter, or null if not found.',
          type: 'String'
        }
      ],
      type: 'String'
    },
    {
      name: 'getParameterValues',
      args: [
        {
          name: 'name',
          documentation: 'Return array of vales for named parameter, or null if not found.',
          type: 'String'
        }
      ],
      type: 'String[]'
    }
  ]
});
