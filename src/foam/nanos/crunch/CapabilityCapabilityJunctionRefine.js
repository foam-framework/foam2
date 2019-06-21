foam.CLASS({
    package: 'foam.nanos.crunch',
    name: 'CapabilityCapabilityJunctionRefine',
    refines: 'foam.nanos.crunch.CapabilityCapabilityJunction',
  
    properties: [
      {
        name: 'deprecated',
        class: 'Reference',
        of: 'foam.nanos.crunch.Capability',
        expression: function() { return this.sourceId; }
      },
      {
        name: 'deprecating',
        class: 'Reference',
        of: 'foam.nanos.crunch.Capability',
        expression: function() { return this.targetId; }
      }
    ]
  });
  