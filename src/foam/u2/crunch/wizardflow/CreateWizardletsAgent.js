/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CreateWizardletsAgent',

  implements: [
    'foam.core.ContextAgent'
  ],

  imports: [
    'capabilities',
    'getWAO' // Provided  by LoadCapabilitiesAgent
  ],

  exports: [
    'wizardlets'
  ],

  requires: [
    'foam.nanos.crunch.MinMaxCapability',
    'foam.nanos.crunch.ui.CapableWAO',
    'foam.nanos.crunch.ui.PrerequisiteAwareWizardlet'
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
      this.wizardlets = await this.parseArrayToWizardlets(this.capabilities);
    },
    async function parseArrayToWizardlets(array, parent) {
      var capabilityDesired = array[array.length - 1];
      var capabilityPrereqs = array.slice(0, -1);
      var wizardlets = [];

      var rootWizardlet = this.getWizardlet(capabilityDesired);
      var beforeWizardlet = this.getWizardlet(capabilityDesired, true);

      if ( beforeWizardlet ){
        beforeWizardlet.isAvailable$.follow(rootWizardlet.isAvailable$);
        rootWizardlet.data$ = beforeWizardlet.data$;
      }

      var addPrerequisite = (wizardlet) => {
        var defaultPrerequisiteHandling = true;
        var preventPush = false;

        if ( this.isPrerequisiteAware(rootWizardlet) ) {
          preventPush = rootWizardlet.addPrerequisite(wizardlet);
          defaultPrerequisiteHandling = false;
        }

        if ( beforeWizardlet && this.isPrerequisiteAware(beforeWizardlet) ) {
          preventPush = beforeWizardlet.addPrerequisite(wizardlet);
          defaultPrerequisiteHandling = false;
        }

        if ( defaultPrerequisiteHandling )
          wizardlet.isAvailable$.follow(rootWizardlet.isAvailable$);

        return preventPush;
      }

      for ( let capability of capabilityPrereqs ) {
        if ( Array.isArray(capability) ) {
          let subWizardlets = await this.parseArrayToWizardlets(capability);
          let preventPush =
            addPrerequisite(subWizardlets[subWizardlets.length - 1]);
          if ( ! preventPush ) wizardlets.push(...subWizardlets);
          continue;
        }
        let wizardlet = this.getWizardlet(capability);
        let preventPush = addPrerequisite(wizardlet);
        if ( ! preventPush ) wizardlets.push(wizardlet);
      }

      if ( beforeWizardlet ) wizardlets.unshift(beforeWizardlet);
      wizardlets.push(rootWizardlet);
      return wizardlets;
    },
    function getWizardlet(capability, isBefore) {
        let wizardlet = capability[isBefore ? 'beforeWizardlet' : 'wizardlet'];
        return wizardlet && wizardlet.clone(this.__subContext__).copyFrom({
          capability: capability,
          wao: this.getWAO()
        });
    },
    function isPrerequisiteAware(wizardlet) {
      return this.PrerequisiteAwareWizardlet.isInstance(wizardlet);
    },
  ]
});
