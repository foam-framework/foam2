/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntry',

  implements: [
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
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
      documentation: 'Solely for information. Originating Mediator.',
      name: 'mediator',
      class: 'String',
      visibility: 'RO',
      includeInDigest: false,
    },
    {
      documentation: 'Solely for information. Broadcasting Node',
      name: 'node',
      class: 'String',
      visibility: 'RO',
      includeInDigest: false,
    },
    {
      documentation: 'Not necessary but added so date is in object and not added as meta data. Also, a non-null value is required.',
      name: 'lastModifiedBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO',
      javaFactory: 'return 2L;'
    },
    {
      name: 'lastModified',
      class: 'Date',
      visibility: 'RO'
    }
  ]
});
