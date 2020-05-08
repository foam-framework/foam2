/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserCapabilityJunctionRefine',
  refines: 'foam.nanos.crunch.UserCapabilityJunction',

  documentation: `
    Model for UserCapabilityJunction, contains the data needed to grant the
    capability to user.
  `,

  properties: [
    {
      name: 'created',
      class: 'DateTime',
      factory: function() {
        return new Date();
      }
    },
    {
      name: 'expiry',
      class: 'DateTime'
    },
    {
      name: 'data',
      class: 'foam.core.FObjectProperty',
      of: 'foam.core.FObject',
      documentation: `data for capability.of`
    },
    {
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus',
      value: foam.nanos.crunch.CapabilityJunctionStatus.PENDING
    }
  ]
});
