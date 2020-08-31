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
    },
    {
      name: 'overrideTopCapabilityConfig',
      documentation: `
        Set this to true and this StepWizardAgent's config will override
        any wizard configuration specified by the root capability being
        granted.
      `
    }
  ],

  methods: [
    function execute() {
      let topCap = this.capabilities.slice(-1)[0];
      let topCapConfig = topCap.wizardletConfig.cls_.create({
        ...topCap.wizardletConfig.instance_
      }, this);
      let config = this.overrideTopCapabilityConfig
        ? topCapConfig.copyFrom(this.config)
        : this.config.copyFrom(topCapConfig)
        ;
      return new Promise((resolve, _) => {
        var view = this.view;
        this.pushView({
          ...this.view,
          data: this.StepWizardletController.create({
            wizardlets: this.wizardlets,
            config: config
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