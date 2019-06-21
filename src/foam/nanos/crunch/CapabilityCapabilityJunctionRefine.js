foam.CLASS({
    package: 'foam.nanos.crunch',
    name: 'CapabilityCapabilityJunctionRefine',
    refines: 'foam.nanos.crunch.CapabilityCapabilityJunction',
  
    properties: [
      {
        name: 'deprecated',
        class: 'Reference',
        of: 'foam.nanos.crunch.Capability',
        visibility: 'RO',
        expression: function() { return this.sourceId; }
      },
      {
        name: 'deprecating',
        class: 'Reference',
        of: 'foam.nanos.crunch.Capability',
        visibility: 'RO',
        expression: function() { return this.targetId; }
      }
    ]
  });
  