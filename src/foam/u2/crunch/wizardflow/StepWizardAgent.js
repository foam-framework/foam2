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
    'wizardlets',
    'wizardConfig',
    'pushView',
    'popView'
  ],

  exports: [
    'submitted'
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
    },
    {
      name: 'submitted',
      class: 'Boolean'
    }
  ],

  methods: [
    function execute() {
      return new Promise((resolve, reject) => {
        this.pushView({
          ...this.view,
          data: this.StepWizardletController.create({
            wizardlets: this.wizardlets,
            config: this.wizardConfig,
            submitted$: this.submitted$,
          }),
          onClose: (x) => {
            this.popView(x)
            resolve();
          }
        }, () => {
          resolve();
        });
      });
    }
  ]
});