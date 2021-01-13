/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.medusa',
  name: 'DaggerService',

  documentation: `Directed Acyclic Graph (DAG) service which manages indexes and hashes for the Medusa block chain.`,

  methods: [
    {
      documentation: `Initial hash to prime the system.`,
      name: 'getBootstrapHash',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'String'
    },
    {
      documentation: `Return the next available index and the two index/hash pairs used to calculate the next index hash.`,
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
      documentation: `Inform the DAG service that this link is available for hashing against.`,
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
      documentation: `Generate a link in the DAG for a medusa entry.`,
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
      documentation: `Calculate the hash of a medusa entry.`,
      name: 'hash',
      type: 'foam.nanos.medusa.MedusaEntry',
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
      documentation: `Verify the hash of a medusa entry`,
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
      documentation: `Sign a medusa entry`,
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
      documentation: `Update the next available index.`,
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
      documentation: `Retrieve the current global index.`,
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
      documentation: `Retrieve the next available global index.`,
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
