/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.ENUM({
  package: 'foam.nanos.crunch',
  name: 'CapabilityJunctionStatus',
  values: [
    {
      name: 'PENDING',
      label: 'pending',
      background: '#bfae32'
    },
    {
      name: 'GRANTED',
      label: 'granted',
      background: '#32bf5e'
    },
    {
      name: 'EXPIRED',
      label: 'expired',
      background: '#bf3232'
    }
  ]
});
  