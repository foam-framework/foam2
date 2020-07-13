/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntry',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.medusa.DaggerLink'
  ],

  documentation: `Ledger entry.`,

  ids: [
    'index'
  ],

  tableColumns: [
//    'id',
    'nSpecName',
    'index',
    'index1',
    'index2',
    'consensusCount',
    'promoted',
    'consensusNodes',
    'lastModified'
  ],

  properties: [
    // {
    //   class: 'String',
    //   name: 'id',
    //   visibility: 'RO',
    //   includeInDigest: false
    // },
    {
      class: 'String',
      name: 'nSpecName',
      label: 'NSpec Name',
      visibility: 'RO',
      tableWidth: 200
    },
    {
      class: 'Enum',
      of: 'foam.dao.DOP',
      name: 'dop',
      visibility: 'RO'
    },
    {
      name: 'index',
      class: 'Long',
      visibility: 'RO',
      tableWidth: 150
    },
    {
      name: 'hash',
      class: 'String',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'index1',
      visibility: 'RO',
      tableWidth: 150
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
      tableWidth: 150
    },
    {
      class: 'String',
      name: 'hash2',
      visibility: 'HIDDEN',
      storageTransient: true
    },
    {
      document: 'Stringified FObject',
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
      class: 'String',
      name: 'signature',
      visibility: 'RO'
    },
    {
      name: 'consensusCount',
      class: 'Int',
      visibility: 'RO',
      storageTransient: true,
      clusterTransient: true,
      tableWidth: 150
    },
    {
      documentation: `Track Entries and Nodes - as we need consensus based on unique Entry.  If a node startup, stopped, started, the mediators would get the entry twice and if not distiguishing would assume two same hash copies, for example.`,
      name: 'consensusNodes',
      class: 'List',
      visibility: 'RO',
      factory: function() { return new []; },
      javaFactory: 'return new java.util.ArrayList();',
      storageTransient: true,
      clusterTransient: true,
      tableWidth: 150,
      tableCellFormatter: function(value) {
        this.add(value && value.join());
      }
    },
    {
      name: 'verified',
      class: 'Boolean',
      visibility: 'RO',
      storageTransient: true,
      clusterTransient: true,
    },
    {
      name: 'promoted',
      class: 'Boolean',
      visibility: 'RO',
      storageTransient: true,
      clusterTransient: true,
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
      storageTransient: true
    },
    {
      name: 'created',
      class: 'DateTime',
      visibility: 'RO',
      includeInDigest: false,
    },
    {
      documentation: 'Not necessary but added so date is in object and not added as meta data. Also, a non-null value is required.',
      name: 'lastModifiedBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'HIDDEN',
      value: 2,
      includeInDigest: false,
    },
    {
      name: 'lastModified',
      label: 'Stored',
      class: 'DateTime',
      visibility: 'RO',
      includeInDigest: false,
    }
  ],

  methods: [
    {
      name: 'freeze',
      type: 'FObject',
      javaCode: `
      return this;
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.index + ' ' + this.nSpecName;
      },
      javaCode: `
        return getIndex() + " " + getNSpecName();
      `
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: `return toSummary();`
    }
  ]
});
