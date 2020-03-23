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
    "globalIndex1",
    "globalIndex2",
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
      name: 'globalIndex1',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'hash1',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'globalIndex2',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'hash2',
      visibility: 'RO'
    },
    {
      class: 'FObjectProperty',
      name: 'old',
      visibility: 'RO'
    },
    {
      class: 'FObjectProperty',
      name: 'nu',
      visibility: 'RO'
    },
    {
      // TODO: what is this?
      class: 'String',
      name: 'localHash',
      visibility: 'RO',
      networkTransient: true
    },
    {
      class: 'String',
      name: 'signature',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'internalHash',
      visibility: 'RO',
      includeInDigest: false,
    },
    {
      name: 'hasConsensus',
      class: 'Boolean',
      value: false,
      visibility: 'RO'
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
