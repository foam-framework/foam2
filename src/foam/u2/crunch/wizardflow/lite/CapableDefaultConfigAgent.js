/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CapableDefaultConfigAgent',

  implements: [
    'foam.core.ContextAware'
  ],

  imports: [
    'capabilities'
  ],

  requires: [
    'foam.u2.wizard.StepWizardConfig'
  ],

  exports: [
    'config as wizardConfig'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.StepWizardConfig',
      name: 'config'
    }
  ],

  methods: [
    async function execute() {
      this.config = this.StepWizardConfig.create({
        allowSkipping: false,
        allowBacktracking: false,
      });
    }
  ]
});

