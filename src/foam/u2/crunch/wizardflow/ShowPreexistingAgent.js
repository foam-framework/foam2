/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'ShowPreexistingAgent',
  documentation: `
    To show ACTION_REQUIRED wizardlets since they were previously saved
  `,
  imports: [ 'wizardlets' ],
  requires: [
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],


  methods: [
    async function execute() {
      for ( let wizardlet of this.wizardlets ){
        if (
          foam.nanos.crunch.ui.MinMaxCapabilityWizardlet.isInstance(wizardlet) &&
          wizardlet.data.selectedData.length > 0
        ){
          var selectedDataCapabilityIds = wizardlet.data.selectedData;

          for ( let choiceWizardlet of wizardlet.choiceWizardlets ){
            if ( selectedDataCapabilityIds.includes(choiceWizardlet.capability.id) ){
              choiceWizardlet.isAvailable = true;
            }
          }
        }
      }
    }
  ],
});
