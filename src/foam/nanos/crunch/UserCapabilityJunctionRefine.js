
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
  model for UserCapabilityJunction, contains the data needed to grant the capability to user. 
  right now userId and capabilityId are not updated property with the source/target Ids.
  `,

  properties: [
    {
      name: 'userId',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO',
      expression: function() { return this.sourceId; }
    },
    {
      name: 'capabilityId',
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      visibility: 'RO',
      expression: function() { return this.targetId; }
    },
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
