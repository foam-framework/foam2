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
      name: 'allowSkipping'
    },
    {
      class: 'Boolean',
      name: 'allowBacktracking',
      value: true
    },
    {
      class: 'Boolean',
      name: 'requireAll'
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
