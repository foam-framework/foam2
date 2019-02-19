/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'ClusterConfig',

  documentation: 'Multi-role active clustering - used by high availability system and clustering.',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'userDAO',
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Allows for prepatory configuration changes.',
      value: true
    },
    {
      documentation: 'Node local network or DNS name',
      name: 'id',
      class: 'String',
      label: 'hostname',
      aliases: ['name', 'hostname'],
      required: true
    },
    {
      documentation: 'Group of nodes. Encompases all nodes in all Regions for the same application.',
      name: 'realm',
      class: 'String',
      required: 'true',
    },
    {
      documentation: 'Geographic region of group nodes. A sub group in the Realm.',
      name: 'region',
      class: 'String',
    },
    {
      documentation: 'Type of a node',
      name: 'nodeType',
      class: 'Enum',
      of: 'foam.nanos.mrac.NodeType',
    },
    {
      documentation: 'Status of a node',
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.mrac.Status',
    },
    {
      name: 'accessMode',
      class: 'Enum',
      of: 'foam.nanos.mrac.AccessMode',
      documentation: 'Mode of a node (read-only, read-write or write-only)'
    },
    {
      name: 'port',
      class: 'Int',
      value: 8080 // 9001
    },
    {
      documentation: 'Creation date.',
      name: 'created',
      class: 'DateTime',
      visibility: 'RO',
    },
    {
      documentation: `The id of the user who created the transaction.`,
      name: 'createdBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      }
    },
    {
      documentation: 'Last modified date.',
      name: 'lastModified',
      class: 'DateTime',
      visibility: 'RO',
    },
    {
      documentation: `The id of the user who created the transaction.`,
      name: 'lastModifiedBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      }
    },
 ]
});

