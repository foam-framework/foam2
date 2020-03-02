/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'MedusaEntry',

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'String',
      name: 'nspecKey'
    },
    {
      class: 'String',
      name: 'action'
    },
    {
      class: 'Long',
      name: 'globalIndex1'
    },
    {
      class: 'String',
      name: 'hash1'
    },
    {
      class: 'Long',
      name: 'globalIndex2'
    },
    {
      class: 'String',
      name: 'hash2'
    },
    {
      class: 'Long',
      name: 'myIndex'
    },
    {
      class: 'String',
      name: 'myHash'
    },
    {
      //TODO: make it networkTransist.
      class: 'String',
      name: 'localHash'
    },
    {
      class: 'FObjectProperty',
      name: 'old'
    },
    {
      class: 'FObjectProperty',
      name: 'nu'
    },
    {
      class: 'String',
      name: 'signature'
    },
    {
      class: 'String',
      name: 'internalHash',
      includeInDigest: false,
    }
  ],

  methods: [
    {
      name: 'compareTo',
      type: 'int',
      args: [ { name: 'o', type: 'Any' } ],
      javaCode: `
        if ( o == this ) return 0;
        if ( o == null ) return 1;
        if ( ! ( o instanceof MedusaEntry ) ) return 1;

        MedusaEntry entry = (MedusaEntry) o;
        return Long.compare(this.getMyIndex(), entry.getMyIndex());
      `
    }
  ]
});
