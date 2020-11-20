foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapableWizardletDataController',
  extends: 'foam.u2.wizard.WizardletDataController',

  imports: [
    'capable',
    'crunchService'
  ],

  requires: [
    'foam.nanos.crunch.ui.CapabilityWizardlet',
    'foam.nanos.crunch.ui.CapableObjectWizardlet'
  ],

  properties: [
    {
      name: 'targetPayload',
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.lite.CapablePayload'
    },
    {
      name: 'save',
      class: 'Function',
      value: async function (wizardlet) {
        if ( wizardlet.isAvailable ){
          return this.capable.getCapablePayloadDAO().put(
            this.targetPayload
          );
        }
      }
    },
    {
      name: 'cancel',
      class: 'Function',
      value: async function (wizardlet) {
        return this.capable.getCapablePayloadDAO().remove(
          this.targetPayload
        );
      }
    },
    {
      name: 'load',
      class: 'Function',
      value: async function (wizardlet) {
        wizardlet.status = this.targetPayload.status;

        // No 'of'? No problem
        if ( ! wizardlet.of ) return wizardlet;

        // Load CapablePayload data to wizardlet
        var loadedData = wizardlet.of.create({}, wizardlet);
        if ( this.targetPayload.data ) {
          loadedData.copyFrom(this.targetPayload.data);
        }

        // Set transient 'capability' property if it exists
        var prop = wizardlet.of.getAxiomByName('capability');
        if ( prop ) prop.set(loadedData, wizardlet.capability);

        // Finally, apply new data to wizardlet
        wizardlet.data = loadedData;
        return;
      }
    }
  ]
});
