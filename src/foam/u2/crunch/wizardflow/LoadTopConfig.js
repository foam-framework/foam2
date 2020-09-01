/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'LoadTopConfig',

  implements: [
    'foam.core.ContextAware'
  ],

  imports: [
    'capabilities'
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
      let topCap = this.capabilities.slice(-1)[0];
      this.config = topCap.wizardletConfig.cls_.create({ ...topCap.wizardletConfig.instance_ }, this);
      return this.config.execute();
    }
  ]
});
