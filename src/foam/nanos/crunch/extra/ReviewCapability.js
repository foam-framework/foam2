/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.extra',
  name: 'ReviewCapability',
  extends: 'foam.nanos.crunch.Capability',
  documentation: `
    This capability displays a portal to another capability as well
    as its own data. This is useful for implementing a review process.
  `,

  requires: [
    'foam.nanos.crunch.ui.ReviewCapabilityWizardlet'
  ],

  properties: [
    {
      class: 'Object',
      name: 'wizardlet',
      documentation: `
        Defines a wizardlet used when displaying this capability on related client crunch wizards.
      `,
      factory: function() {
        return this.ReviewCapabilityWizardlet.create();
      }
    },
    {
      name: 'capabilityToReview',
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      view: 'foam.nanos.crunch.ui.UCJView'
    },
    {
      name: 'of',
      class: 'Class',
      factory: function() {
        return 'foam.nanos.crunch.extra.ReviewCapabilityData';
      },
      javaFactory: 'return ReviewCapabilityData.getOwnClassInfo();'
    }
  ],
});
