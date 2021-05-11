/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntry',

  documentation: `A Medusa journal entry. Each DAO put or remove operation resulting in a change is captured by a MedusaEntry.
The data of a MedusaEntry is the json delta of the original put or remove DAO operation. For example, if a User's lastName was modified, the corresponding MedusaEntry would have a data of the json of just the lastName change.`,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.medusa.DaggerLink'
  ],

  ids: [
    'index'
  ],

  tableColumns: [
    'nSpecName',
    'dop',
    'index',
    'index1',
    'index2',
    'promoted',
    'consensusCount',
    'consensusNodes'
  ],

  properties: [
    {
      class: 'String',
      name: 'nSpecName',
      label: 'NSpec Name',
      visibility: 'RO',
      tableWidth: 225
    },
    {
      class: 'Enum',
      of: 'foam.dao.DOP',
      name: 'dop',
      visibility: 'RO',
      tableWidth: 100
    },
    {
      name: 'index',
      class: 'Long',
      visibility: 'RO',
      tableWidth: 100
    },
    {
      name: 'hash',
      class: 'String',
      visibility: 'RO',
      tableWidth: 100
    },
    {
      class: 'Long',
      name: 'index1',
      visibility: 'RO',
      tableWidth: 100
    },
    {
      class: 'String',
      name: 'hash1',
      visibility: 'HIDDEN',
      storageTransient: true
    },
    {
      class: 'Long',
      name: 'index2',
      visibility: 'RO',
      tableWidth: 100
    },
    {
      class: 'String',
      name: 'hash2',
      visibility: 'HIDDEN',
      storageTransient: true
    },
    {
      document: 'Stringified FObject of non storageTransient properties',
      class: 'String',
      name: 'data',
      visibility: 'RO',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 4,
        cols: 144
      }
    },
    {
      document: 'Stringified FObject of only storageTransient properties',
      class: 'String',
      name: 'transientData',
      storageTransient: true,
      visibility: 'RO',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 4,
        cols: 144
      }
    },
    {
      class: 'String',
      name: 'signature',
      visibility: 'RO'
    },
    {
      documentation: `Count of nodes contributing to a particular hash.  Until consensus is reached, count of the hash with the most nodes.`,
      name: 'consensusCount',
      label: 'Count',
      class: 'Int',
      visibility: 'RO',
      storageTransient: true,
      clusterTransient: true,
      tableWidth: 100
    },
    {
      documentation: `Record which nodes contributed to consensus of a particular hash. Until consensus is reached, list is the hash with most nodes.`,
      name: 'consensusNodes',
      label: 'Nodes',
      class: 'StringArray',
      visibility: 'RO',
      factory: function() { return []; },
      javaFactory: 'return new String[0];',
      storageTransient: true,
      clusterTransient: true,
      tableWidth: 150,
      tableCellFormatter: function(value) {
        this.add(value && value.join());
      }
    },
    {
      documentation: `Track Entries and Nodes - as we need consensus based on unique Entry.  If a node startup, stopped, started, the mediators would get the entry twice and if not distiguishing would assume two same hash copies, for example.`,
      name: 'consensusHashes',
      class: 'Map',
      visibility: 'HIDDEN',
      factory: function() { return {}; },
      javaFactory: 'return new java.util.HashMap();',
      transient: true,
    },
    {
      name: 'promoted',
      class: 'Boolean',
      visibility: 'RO',
      storageTransient: true,
      clusterTransient: true,
    },
    {
      name: 'algorithm',
      class: 'String',
      value: 'SHA-256',
      visibility: 'RO'
    },
    {
      documentation: 'Solely for information. Originating Mediator.',
      name: 'mediator',
      class: 'String',
      visibility: 'RO',
      storageTransient: true
    },
    {
      documentation: 'Set when journal on the Node. Used to distinguish unique entries during consensus determination.',
      name: 'node',
      class: 'String',
      visibility: 'RO',
      includeInDigest: false, // REVIEW: false to deal with node change (at the moment) when sent to STANDBY Region, but believe this a security hole; without node in digest, one could send the same entry quorum times with a different node set. Also see comments in MedusaSetNodeDAO - Joel
    },
    {
      name: 'created',
      class: 'DateTime',
      visibility: 'RO',
      storageOptional: true,
      includeInDigest: false,
    },
    {
      documentation: 'Not necessary but added so date is in object and not added as meta data. Also, a non-null value is required.',
      name: 'lastModifiedBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'HIDDEN',
      value: 2,
      storageOptional: true,
      includeInDigest: false,
    },
    {
      name: 'lastModifiedByAgent',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'HIDDEN',
      value: 2,
      storageOptional: true,
      includeInDigest: false,
    },
    {
      name: 'lastModified',
      label: 'Stored',
      class: 'DateTime',
      visibility: 'RO',
      tableWidth: 150,
      storageOptional: true,
      includeInDigest: false,
    }
  ],

  methods: [
    {
      name: 'fclone',
      type: 'FObject',
      javaCode: `
      // return this;
      return this.shallowClone();
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.nSpecName + ':' + this.index;
      },
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(getNSpecName());
        sb.append(":");
        sb.append(getIndex());
        if ( ! foam.util.SafetyUtil.isEmpty(getHash()) ) {
          sb.append(":");
          sb.append(getHash().substring(0,7));
        }
        return sb.toString();
      `
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: `return toSummary();`
    }
  ]
});
