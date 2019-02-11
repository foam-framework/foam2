/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
    package: 'foam.nanos.mrac',
    name: 'NodeType',

    documentation: `
      Type of a node/instance in a cluster.
    `,

    values: [
      {
        name: 'PRIMARY',
        label: 'Primary',
        documentation: 'Master - receives all ‘put’ operations'
      },
      {
        name: 'SECONDARY',
        label: 'Secondary',
        documentation: 'Slave - handles any ‘read’ operation. Involved in voting for new PRIMARY '
      },
      {
        name: 'REPLICA',
        label: 'Replica',
        documentation: 'Can handle any ‘read’ operation (nanopay instance)'
      }
    ]
  });

  foam.ENUM({
    package: 'foam.nanos.mrac',
    name: 'Status',

    documentation: `
      Status of a node/instance in a cluster.
    `,

    values: [
      {
        name: 'ONLINE',
        label: 'Online',
        documentation: 'Active node'
      },
      {
        name: 'OFFLINE',
        label: 'Offline',
        documentation: 'Removed from cluster considerations: failed, maintenance, etc '
      }
    ]
  });

  foam.ENUM({
    package: 'foam.nanos.mrac',
    name: 'AccessMode',

    documentation: `
      Mode of a node in a cluster.
    `,

    values: [
      {
        name: 'RO',
        label: 'Read-Only'
      },
      {
        name: 'RW',
        label: 'Read-Write'
      },
      {
        name: 'WO',
        label: 'Write-Only',
        documentation: 'Example: External customer SQL databases.'
      }
    ]
  });

  foam.CLASS({
    package: 'foam.nanos.mrac',
    name: 'MRACConfig',

    documentation: 'Multi-role active clustering - used by high availability system and clustering.',

    properties: [
      {
        class: 'String',
        name: 'id',
        aliases: '[name, hostname]',
        documentation: 'Node name/id - hostname',
        visibility: 'RO'
      },
      {
        class: 'String',
        name: 'realm',
        documentation: 'Group of nodes. Encompases all nodes in all Regions for the same application.'
      },
      {
        class: 'String',
        name: 'region',
        documentation: 'Geographic region of group nodes. A sub group in the Realm.'
      },
      {
        class: 'Enum',
        of: 'foam.nanos.mrac.NodeType',
        name: 'nodeType',
        documentation: 'Type of a node'
      },
      {
        class: 'Enum',
        of: 'foam.nanos.mrac.Status',
        name: 'status',
        documentation: 'Status of a node'
      },
      {
        class: 'Enum',
        of: 'foam.nanos.mrac.AccessMode',
        name: 'accessMode',
        documentation: 'Mode of a node (read-only, read-write or write-only)'
      },
      {
        class: 'Int',
        name: 'port',
        value: 9001
      },
    ]
  });

