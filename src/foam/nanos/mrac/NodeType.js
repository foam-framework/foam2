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
