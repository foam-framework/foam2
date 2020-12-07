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
    'crunchService'
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
      return;
      var capable = this.capable;
      var capablePayloads = await this.crunchService.getCapableObjectPayloads(null, this.capable.capabilityIds)
      var wizardletsTuple = await this.createWizardletsFromPayloads(capablePayloads);

      // TODO: not sure how this is going tto work if you have some of the payloads, might have to filter them out
      // need to finalize with eric before proceeding
      this.wizardlets = wizardletsTuple.allDescendantWizardlets;
      console.log('CAPABLE', capable);
      console.log('WIZARDLETS', this.wizardlets);
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
          dataController: this.CapableWAO.create(
          {}, this.__context__)
        }, this.__subContext__);
    },
    function isPrerequisiteAware(wizardlet) {
      return this.PrerequisiteAwareWizardlet.isInstance(wizardlet);
    },
    async function createWizardletsFromPayloads(payloads) {
      var newWizardlets = [];
      var childWizardlets = [];
      for ( let i = 0 ; i < payloads.length ; i++ ) {
        let capablePayload = payloads[i];
        let wizardlet = await this.createWizardletFromPayload(capablePayload);
        let handlePrereqsNormally = true;
        let addWizardletAtEnd = true;

        // If this is a MinMax capability, handle its prerequisites differently
        var capability = await this.capabilityDAO.find(capablePayload.capability);

        if ( this.MinMaxCapability.isInstance(capability) ) {
          handlePrereqsNormally = false;
          addWizardletAtEnd = false;

          // MinMax wizardlets appear before their prerequisites
          newWizardlets.push(wizardlet);
          childWizardlets.push(wizardlet);

          let minMaxPrereqWizardlets =
            await this.createWizardletsFromPayloads(capablePayload.prerequisites);

          capablePayload.prerequisites = null;

          minMaxPrereqWizardlets.directChildrenWizardlets.forEach(prereqWizardlet => {
            prereqWizardlet.isAvailable = false;
            wizardlet.choiceWizardlets.push(prereqWizardlet);
          })

          newWizardlets = [
            ...newWizardlets,
            ...minMaxPrereqWizardlets.allDescendantWizardlets
          ]
        }

        // If this is a prerequisite of a normal capability, bind isAvailable to the
        // parent.
        if ( handlePrereqsNormally && capablePayload.prerequisites.length > 0 ) {
          let prereqWizardlets =
            await this.createWizardletsFromPayloads(capablePayload.prerequisites);

          capablePayload.prerequisites = null;

          prereqWizardlets.directChildrenWizardlets.forEach(prereqWizardlet => {
            prereqWizardlet.isAvailable$.follow(wizardlet.isAvailable$);
          })

          newWizardlets = [
            ...newWizardlets,
            ...prereqWizardlets.allDescendantWizardlets
          ]
        }

        // Wizardlets appear after their prerequisites by default
        if ( addWizardletAtEnd ) {
          newWizardlets.push(wizardlet);
          childWizardlets.push(wizardlet);
        }
      }

      return {
        allDescendantWizardlets: newWizardlets,
        directChildrenWizardlets: childWizardlets
      };
    },
    async function createWizardletFromPayload(capablePayload) {
      var capability = await this.capabilityDAO.find(capablePayload.capability);

      let wizardletClass = capability.wizardlet.cls_;

      let wizardlet = wizardletClass.create({
        capability: capability,
        data$: capablePayload.data$,
        dataController: this.CapableWAO.create(
          {}, this.__context__)
      }, this);

      wizardlet.dataController.targetPayload = capablePayload;

      return wizardlet;
    },
  ]
});
