/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.extra',
  name: 'ReviewCapability',
  documentation: `
    This capability displays a portal to another capability with
    review options.
  `,

  properties: [
    {
      name: 'capabilityToReview',
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      view: 'foam.nanos.crunch.ui.UCJView'
    },
    {
      name: 'reviewed',
      class: 'Boolean'
    }
  ],

  // TODO: validate; reviewed must be true
});
