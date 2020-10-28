/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.dao',
  name: 'Adapter',

  documentation: `Adapter interface for DAO objects`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X'
  ],

  methods: [
    {
      name: 'adaptToDelegate',
      type: 'FObject',
      args: [
        {
          name: 'ctx',
          type: 'X'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ]
    },
    {
      name: 'adaptFromDelegate',
      type: 'FObject',
      args: [
        {
          name: 'ctx',
          type: 'X'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
      ]
    }
  ]
});
