/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'FilterGrantModeAgent',
  extends: 'foam.u2.crunch.wizardflow.FilterWizardletsAgent',
  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.nanos.crunch.ui.CapabilityWizardlet',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityGrantMode'
  ],

  properties: [
    {
      name: 'allowedModes',
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.CapabilityGrantMode',
      factory: function () {
        return [ this.CapabilityGrantMode.AUTOMATIC ];
      }
    }
  ],

  methods: [
    async function execute() {
      this.wizardlets = foam.Array.filter(
        this.unfilteredWizardlets,
        this.AND(
          this.INSTANCE_OF(this.CapabilityWizardlet),
          this.IN(
            this.DOT(
              this.CapabilityWizardlet.CAPABILITY,
              this.Capability.GRANT_MODE),
            this.allowedModes)));
    }
  ]
});
