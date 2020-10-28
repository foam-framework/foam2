/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'ReviewCapabilityWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',

  properties: [
    {
      name: 'sections',
      factory: function () {
        var reviewSection = this.WizardletSection.create({
          title: 'Review',
          data$: this.data$,
          isAvailable: true,
          customView: {
            class: 'foam.nanos.crunch.ui.ReviewCapabilityView',
            capabilityId: this.capability.capabilityToReview,
            data$: this.data$
          }
        })
        return [ reviewSection ];
      }
    },
    {
      name: 'isValid',
      class: 'Boolean',
      documentation: `
        Override of isValid to omit per-section logic; it is not needed
        for ReviewCapabilityData which contains only the default section.
      `,
      expression: function (of, data, currentSection, data$errors_) {
        if ( ! this.of ) return true;
        if ( data$errors_ && data$errors_.length > 0 ) {
          return false;
        }
        return true;
      }
    },
  ],
})