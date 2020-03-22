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

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      // TODO: remove
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'String',
      name: 'nspecKey'
    //   name: 'nSpecName'
    },
    {
      // rename to op or operation
      class: 'String',
      name: 'action'
    },
    {
      class: 'Long',
      name: 'globalIndex1'
      // rename to 'index1'
    },
    {
      class: 'String',
      name: 'hash1'
    },
    {
      class: 'Long',
      name: 'globalIndex2'
      // rename to index2
    },
    {
      class: 'String',
      name: 'hash2'
    },
    {
      class: 'Long',
      name: 'myIndex'
      // TODO: rename to index
    },
    {
      class: 'String',
      name: 'myHash'
      // TODO: rename to hash
    },
    {
      //TODO: make it networkTransist.
      class: 'String',
      name: 'localHash',
      networkTransient: true
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
    },

    // DaggerLink
    // TODO: rename above.
    {
      name: 'index',
      class: 'Long',
      javaGetter: 'return getMyIndex();'
    },
    {
      name: 'hash',
      class: 'String',
      javaGetter: 'return getMyHash();'
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
