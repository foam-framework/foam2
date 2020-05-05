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
      visibility: 'RO'
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
      visibility: 'HIDDEN',
      storageTransient: true
    },
    {
      class: 'Long',
      name: 'index2',
      visibility: 'RO'
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
    },
    {
      documentation: 'Solely for information. Originating Mediator.',
      name: 'mediator',
      class: 'String',
      visibility: 'RO',
      storageTransient: true
    },
    {
      documentation: 'Solely for information. Broadcasting Node',
      name: 'node',
      class: 'String',
      visibility: 'HIDDEN',
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
  ]
});
