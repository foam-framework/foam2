/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardConfig',

  implements: [
    'foam.core.ContextAware'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'allowSkipping',
      documentation: `
        Allow skipping sections without completing them in incremental wizards.
      `
    },
    {
      class: 'Boolean',
      name: 'allowBacktracking',
      value: true,
      documentation: `
        Allow going back to previous sections in incremental wizards.
      `
    },
    {
      class: 'Boolean',
      name: 'requireAll',
      documentation: `
        Require all sections to be valid to invoke wizard completion (done button).
      `
    },
    {
      class: 'Boolean',
      name: 'approvalMode',
      documentation: `
        Set to true when ScrollingWizard is used to view UCJ data
        accociated to an Approval Request.
      `,
      value: false
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'wizardView',
      flags: ['web'], // Temporary
      documentation: `
        Specify a view to use with this controller. This property isn't used by
        StepWizardController, but it can be used where a wizard is launched so
        that only providing this configuration object is necessary.
      `,
      // value: { class: 'foam.u2.wizard.IncrementalStepWizardView' }
      value: { class: 'foam.u2.wizard.ScrollingStepWizardView' }
    }
  ],

  methods: [
    async function execute(){
      return;
    }
  ]
});
