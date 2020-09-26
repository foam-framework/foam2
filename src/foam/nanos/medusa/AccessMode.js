/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.ENUM({
  package: 'foam.nanos.medusa',
  name: 'AccessMode',

  documentation: `
      Mode of a node in a cluster.
    `,

  values: [
    {
      name: 'RO',
      label: 'Read-Only',
      color: 'gray'
    },
    {
      name: 'RW',
      label: 'Read-Write',
      color: 'green'
    },
    {
      documentation: 'Example: External customer SQL databases.',
      name: 'WO',
      label: 'Write-Only',
      color: 'orange'
    }
  ]
});
