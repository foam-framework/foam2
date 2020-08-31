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
    'wizardlets'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'foam.u2.wizard.StepWizardletController'
  ],

  methods: [
    function execute() {
      let topCap = this.capabilities.slice(-1)[0];
      let config = topCap.wizardletConfig.cls_.create({ ...topCap.wizardletConfig.instance_ }, this);
      return new Promise((resolve, _) => {
        ctrl.add(this.Popup.create({ closeable: false }).tag({
          class: 'foam.u2.wizard.StepWizardletView',
          data: this.StepWizardletController.create({
            wizardlets: this.wizardlets,
            config: config
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