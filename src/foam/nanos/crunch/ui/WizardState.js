/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'WizardState',
  documentation: `
    The first time a user opens a wizard with respect to a CRUNCH capability,
    the wizard will not display any capabilities that were previously granted.
    However, if the wizard is set to display completed capabilities, then any
    subsequent invocation of the wizard should still show the newly GRANTED
    capabilities.

    WizardState stores a list of capabilities that were granted on the first
    invocation of a wizard with respect to a specific top-level capability to
    support the behaviour described above.
  `,

  ids: ['realUser', 'effectiveUser', 'capability'],

  properties: [
    {
      name: 'realUser',
      class: 'Reference',
      of: 'foam.nanos.auth.User'
    },
    {
      name: 'effectiveUser',
      class: 'Reference',
      of: 'foam.nanos.auth.User'
    },
    {
      name: 'capability',
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability'
    },
    {
      name: 'ignoreList',
      class: 'StringArray',
      documentation: `
        List of capabilities to ignore when rendering the wizard.
      `
    }
  ],
});

// This did not work - used multiple ID instead
// foam.RELATIONSHIP({
//   package: 'foam.nanos.crunch.ui',
//   extends:'foam.nanos.crunch.ui.WizardState',
//   sourceModel: 'foam.nanos.auth.User',
//   targetModel: 'foam.nanos.crunch.Capability',
//   junctionModel: 'foam.nanos.crunch.ui.UserCapabilityWizardState',
//   cardinality: '*:*',
//   forwardName: 'capabilityWizardStates',
//   inverseName: 'userWizardStates'
// });
