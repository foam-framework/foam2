/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntry',

  implements: [
    'foam.nanos.medusa.DaggerLink'
  ],

  tableColumns: [
    "id",
    "nSpecName",
    "index",
    "index1",
    "index2",
    "hasConsensus"
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'nSpecName',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'action',
      visibility: 'RO'
    },
    {
      name: 'index',
      class: 'Long',
      visibility: 'RO'
    },
    {
      name: 'hash',
      class: 'String',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'index1',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'hash1',
      visibility: 'RO',
      storageTransient: true,
      includeInDigest: false
    },
    {
      class: 'Long',
      name: 'index2',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'hash2',
      visibility: 'RO',
      storageTransient: true,
      includeInDigest: false
    },
    {
      class: 'FObjectProperty',
      name: 'data',
      visibility: 'RO'
    },
    {
      // TODO: what is this? - handled by HashingJDAO
      class: 'String',
      name: 'localHash',
      visibility: 'RO',
      networkTransient: true,
      includeInDigest: false,
    },
    {
      class: 'String',
      name: 'internalHash',
      visibility: 'RO',
      includeInDigest: false,
    },
    {
      class: 'String',
      name: 'signature',
      visibility: 'RO'
    },
    {
      name: 'hasConsensus',
      class: 'Boolean',
      value: false,
      visibility: 'RO',
      includeInDigest: false,
    },
    {
      name: 'mediator',
      class: 'String',
      visibility: 'RO',
      includeInDigest: false,
    },
    {
      name: 'node',
      class: 'String',
      visibility: 'RO',
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
        return Long.compare(this.getIndex(), entry.getIndex());
      `
    }
  ]
});
