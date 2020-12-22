/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'WizardStateAgent',
  extends: 'foam.u2.crunch.wizardflow.FilterWizardletsAgent',
  documentation: `
    Perform stateful filtering logic. A wizard opened the first time will filter
    capabilities which have been granted, and subsquent instances of the wizard
    will filter these same capabilities regardless of which are granted.
  `,
  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'crunchService',
    'rootCapability'
  ],

  requires: [
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.ui.CapabilityWizardlet'
  ],

  methods: [
    async function execute() {
      var wizardState = await this.crunchService.getWizardState(
        null, this.rootCapability.id);
      this.wizardlets = foam.Array.filter(
        this.unfilteredWizardlets,
        this.NOT(
          this.IN(
            this.DOT(
              this.CapabilityWizardlet.CAPABILITY,
              this.Capability.ID),
            wizardState.ignoreList))
      );
    }
  ]
});
