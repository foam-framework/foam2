/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.medusa',
  name: 'DaggerService',

  methods: [
    {
      name: 'getNextLinks',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.nanos.medusa.DaggerLinks'
    },
    {
      name: 'updateLinks',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'link',
          type: 'foam.nanos.medusa.DaggerLink'
        }
      ]
    },
    {
      name: 'link',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'entry',
          type: 'foam.nanos.medusa.MedusaEntry'
        }
      ],
      type: 'foam.nanos.medusa.MedusaEntry'
    },
    {
      name: 'hash',
      type: 'String',
      javaThrows: ['java.security.NoSuchAlgorithmException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'entry',
          type: 'foam.nanos.medusa.MedusaEntry'
        }
      ]
    },
    {
      name: 'verify',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'entry',
          type: 'foam.nanos.medusa.MedusaEntry'
        }
      ]
    },
    {
      name: 'sign',
      type: 'String',
      javaThrows: ['java.security.DigestException',
                    'java.security.NoSuchAlgorithmException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'entry',
          type: 'foam.nanos.medusa.MedusaEntry'
        }
      ]
    },
    {
      name: 'setGlobalIndex',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'index',
          type: 'Long'
        }
      ],
      type: 'Long'
    },
    {
      name: 'getGlobalIndex',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Long'
    },
    {
      name: 'getNextGlobalIndex',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Long'
    }
  ]
});
