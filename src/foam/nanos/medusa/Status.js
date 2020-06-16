/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.medusa',
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
