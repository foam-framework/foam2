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
    'capabilityDAO'
  ],

  exports: [
    'wizardlets'
  ],

  requires: [
    'foam.nanos.crunch.MinMaxCapability',
    'foam.nanos.crunch.ui.CapableWAO'
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
      var capable = this.capable;
      var wizardletsTuple = await this.createWizardletsFromPayloads(capable.capablePayloads);
      this.wizardlets = wizardletsTuple.allDescendantWizardlets;
      console.log('CAPABLE', capable);
      console.log('WIZARDLETS', this.wizardlets);
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