
foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserCapabilityJunctionRefine',
  refines: 'foam.nanos.crunch.UserCapabilityJunction',

  properties: [
    {
      name: 'userId',
      class: 'Long'
    },
    {
      name: 'capabilityId',
      class: 'String'
    },
    {
      name: 'created',
      class: 'DateTime',
    },
    {
      name: 'expiry',
      class: 'DateTime'
    },
    {
      name: 'data',
      class: 'FObjectProperty',
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
