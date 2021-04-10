/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.medusa',
  name: 'MedusaRegistry',

  documentation: `The MedusaAdapter can register and then wait for the completion of an async MedusaEntry 'put' operation.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X'
  ],

  methods: [
    {
      name: 'register',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'id',
          type: 'Long'
        }
      ]
    },
    {
      name: 'wait',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'id',
          type: 'Long'
        }
      ],
      type: 'FObject'
    },
    {
      name: 'notify',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'entry',
          type: 'foam.nanos.medusa.MedusaEntry'
        }
      ]
    },
    {
      name: 'count',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'id',
          type: 'Long'
        }
      ],
      type: 'Long'
    }
  ]
});
