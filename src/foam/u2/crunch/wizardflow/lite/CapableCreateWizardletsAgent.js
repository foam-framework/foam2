/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CapableCreateWizardletsAgent',

  implements: [
    'foam.core.ContextAgent'
  ],

  imports: [
    'capable',
    'capabilities',
    'capabilityDAO',
    'crunchService',
    'getWAO' // Provided  by LoadCapabilitiesAgent
  ],

  exports: [
    'wizardlets'
  ],

  requires: [
    'foam.nanos.crunch.MinMaxCapability',
    'foam.nanos.crunch.ui.CapableWAO',
    'foam.nanos.crunch.ui.PrerequisiteAwareWizardlet',
    'foam.nanos.crunch.CrunchService'
  ],

  properties: [
    {
      name: 'wizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet'
    }
  ],

  methods: [
    async function execute() {
      var wizardlets = await this.parseArrayToWizardlets(this.capabilities);
      this.wizardlets = wizardlets;
    },
    async function parseArrayToWizardlets(array, parent) {
      var capabilityDesired = array[array.length - 1];
      var capabilityPrereqs = array.slice(0, array.length - 1);
      var wizardlets = [];

      var rootWizardlet = this.getWizardlet(capabilityDesired);
      var beforeWizardlet = this.getWizardlet(capabilityDesired, true);

      if ( beforeWizardlet )
        beforeWizardlet.isAvailable$.follow(rootWizardlet.isAvailable$);

      var addPrerequisite = (wizardlet) => {
        var defaultPrerequisiteHandling = true;

        if ( this.isPrerequisiteAware(rootWizardlet) ) {
          rootWizardlet.addPrerequisite(wizardlet);
          defaultPrerequisiteHandling = false;
        }

        if ( beforeWizardlet && this.isPrerequisiteAware(beforeWizardlet) ) {
          beforeWizardlet.addPrerequisite(wizardlet);
          defaultPrerequisiteHandling = false;
        }

        if ( defaultPrerequisiteHandling )
          wizardlet.isAvailable$.follow(rootWizardlet.isAvailable$);
      }

      for ( let capability of capabilityPrereqs ) {
        if ( Array.isArray(capability) ) {
          let subWizardlets = await this.parseArrayToWizardlets(capability);
          addPrerequisite(subWizardlets[subWizardlets.length - 1]);
          wizardlets.push(...subWizardlets);
          continue;
        }
        let wizardlet = this.getWizardlet(capability);
        addPrerequisite(wizardlet);
        wizardlets.push(wizardlet);
      }

      if ( beforeWizardlet ) wizardlets.unshift(beforeWizardlet);
      wizardlets.push(rootWizardlet);
      return wizardlets;
    },
    function getWizardlet(capability, isBefore) {
        let wizardlet = capability[isBefore ? 'beforeWizardlet' : 'wizardlet'];
        return wizardlet && wizardlet.clone().copyFrom({
          capability: capability,
          dataController: this.getWAO()
        }, this.__subContext__);
    },
    function isPrerequisiteAware(wizardlet) {
      return this.PrerequisiteAwareWizardlet.isInstance(wizardlet);
    },
  ]
});
