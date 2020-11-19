foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapableWizardletDataController',
  extends: 'foam.u2.wizard.WizardletDataController',

  imports: [
    'capable',
    'crunchService'
  ],

  requires: [
    'foam.nanos.crunch.ui.CapabilityWizardlet'
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
        if ( this.CapabilityWizardlet.isInstance(wizardlet) ) {
          wizardlet.status = this.targetPayload.status;
        }
      }
    }
  ]
});
