/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'StepWizardAgent',

  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],

  imports: [
    'capabilities',
    'wizardlets',
    'wizardConfig',
    'pushView',
    'popView'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'foam.u2.wizard.StepWizardletController'
  ],

  properties: [
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.StepWizardConfig',
      factory: function() { return null; }
    },
    {
      name: 'view',
      value: {
        class: 'foam.u2.wizard.StepWizardletView',
      }
    }
  ],

  methods: [
    function execute() {
      return new Promise((resolve, _) => {
        this.pushView({
          ...this.view,
          data: this.StepWizardletController.create({
            wizardlets: this.wizardlets,
            config: this.wizardConfig
          }),
          onClose: (x) => {
            this.popView(x)
            resolve();
          }
        });
      });
    }
  ]
});