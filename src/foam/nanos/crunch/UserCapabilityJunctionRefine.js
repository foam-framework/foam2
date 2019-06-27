
foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserCapabilityJunctionRefine',
  refines: 'foam.nanos.crunch.UserCapabilityJunction',

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
