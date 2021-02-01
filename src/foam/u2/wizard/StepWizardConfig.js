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
      class: 'foam.u2.ViewSpec',
      name: 'wizardView',
      value: { class: 'foam.u2.wizard.IncrementalStepWizardView' }
    }
  ],

  methods: [
    async function execute(){
      return;
    }
  ]
});
