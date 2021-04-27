/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityCapabilityJunctionRefine',
  refines: 'foam.nanos.crunch.CapabilityCapabilityJunction',

  documentation: `
    Refine capabilitycapabilityjunction to add tablecellformatters for source and target id
  `,

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      name: 'sourceId',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.capabilityDAO
          .find(value)
          .then((capability) => this.add(capability.name))
          .catch((error) => {
            this.add(value);
          });
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      name: 'targetId',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.capabilityDAO
          .find(value)
          .then((capability) => this.add(capability.name || capability.id))
          .catch((error) => {
            this.add(value);
          });
      }
    },
    {
      class: 'Boolean',
      name: 'precondition',
      documentation: `
        This property applies to prerequisite capability junctions.

        If a prerequisite is considered a "precondition", it must be granted
        before the corresponding dependant is shown in the capability store.
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      view: { class: 'foam.u2.view.JSONTextView' },
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `,
      documentation: 'The condition under which this capabilitycapabilityjunction would hold.'
    }
  ]
});
