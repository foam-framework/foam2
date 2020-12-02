/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityCategoryCapabilityJunctionRefine',
  refines: 'foam.nanos.crunch.CapabilityCategoryCapabilityJunction',

  documentation: `
    Refine capabilitycategorycapabilityjunction to add tablecellformatters for source and target id
  `,

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      name: 'targetId',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.capabilityDAO
          .find(value)
          .then((capability) => this.add(capability.name))
          .catch((error) => {
            this.add(value);
          });
      }
    }
  ]
});