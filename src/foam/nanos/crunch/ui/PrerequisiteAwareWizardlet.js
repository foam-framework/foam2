/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.crunch.ui',
  name: 'PrerequisiteAwareWizardlet',
  documentation: `
    This interface indicates that a wizardlet needs references to wizardlets
    that would be considered its 'prerequisites'.
  `,

  methods: [
    {
      name: 'addPrerequisite',
      flags: ['web']
    }
  ]
});
