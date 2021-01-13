/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.medusa',
  name: 'RegionStatus',

  documentation: `
      Status of a region or data center in a cluster.
    `,

  values: [
    {
      name: 'STANDBY',
      label: 'Standby',
      ordinal: 0,
      color: 'orange',
      documentation: 'Standby/Passive Region/Data-Center.'
    },
    {
      name: 'ACTIVE',
      label: 'Active',
      ordinal: 1,
      color: 'green',
      documentation: 'Active Region/Data-Center.'
    }
  ]
});
