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
      documentation: 'Standby/Passive Region/Data-Center.'
    },
    {
      name: 'ACTIVE',
      label: 'Active',
      documentation: 'Active Region/Data-Center.'
    }
  ]
});
