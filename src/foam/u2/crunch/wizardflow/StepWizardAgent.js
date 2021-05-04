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
  documentation: `
    Opens the wizard. The scrolling wizard is used by default, but the provided
    config object may specify the incremental wizard to be used instead.
  `,

  imports: [
    'ctrl',
    'initialPosition?',
    'popView',
    'pushView',
    'wizardlets'
  ],

  exports: [
    'submitted'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'foam.u2.wizard.StepWizardConfig',
    'foam.u2.wizard.StepWizardController'
  ],

  properties: [
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.StepWizardConfig',
      factory: function() {
        return this.StepWizardConfig.create();
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
        var data = this.StepWizardController.create({
          wizardlets: this.wizardlets,
          config: this.config,
          submitted$: this.submitted$,
          ...(this.initialPosition ? {
            wizardPosition: this.initialPosition
          } : {})
        })

        this.pushView({
          ...this.config.wizardView,
          data: data,
          closeable: true,
          onClose: (x) => {
            this.popView(x)
            resolve();
          }
        }, (x) => {
          resolve();
        });
      });
    }
  ]
});
