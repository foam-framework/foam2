/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaConsensus',

  implements: [
    'foam.nanos.auth.LastModifiedAware'
  ],

  ids: [
    'hash',
  ],

  tableColumns: [
    'hash',
    'count',
    'promoted',
    'nodes',
    'lastModified'
  ],

  properties: [
    {
      name: 'hash',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'entry',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.MedusaEntry',
      visibility: 'RO',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 4,
        cols: 144
      }
    },
    {
      name: 'count',
      class: 'Int',
      visibility: 'RO',
      storageTransient: true,
      clusterTransient: true,
      tableWidth: 150
    },
    {
      documentation: `Track Entries and Nodes - as we need consensus based on unique Entry.  If a node startup, stopped, started, the mediators would get the entry twice and if not distiguishing would assume two same hash copies, for example.`,
      name: 'nodes',
      class: 'Map',
      visibility: 'RO',
      factory: function() { return {}; },
      javaFactory: 'return new java.util.HashMap();',
      storageTransient: true,
      clusterTransient: true,
      tableWidth: 150,
      tableCellFormatter: function(value) {
        this.add(value && Object.values(value).join());
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
      name: 'fclone',
      type: 'FObject',
      javaCode: `
      return this;
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
