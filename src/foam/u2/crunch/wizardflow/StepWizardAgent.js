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
    'wizardConfig'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'foam.u2.wizard.StepWizardletController'
  ],

  methods: [
    function execute() {
      return new Promise((resolve, _) => {
        ctrl.add(this.Popup.create({ closeable: false }).tag({
          class: 'foam.u2.wizard.StepWizardletView',
          data: this.StepWizardletController.create({
            wizardlets: this.wizardlets,
            config: this.wizardConfig
          }),
          onClose: (x) => {
            x.closeDialog();
            resolve();
          }
        }));
      });
    }
  ]
});