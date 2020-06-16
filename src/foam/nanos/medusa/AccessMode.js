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
