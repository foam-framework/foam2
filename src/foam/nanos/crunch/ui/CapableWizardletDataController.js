foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapableWizardletDataController',

  imports: [
    'crunchService'
  ],

  properties: [
    {
      name: 'save',
      class: 'Function',
      value: async wizardlet => {
        if ( wizardlet.isAvailable ){
          return wizardlet.capable.getCapablePayloadDAO().put(
            wizardlet.targetPayload
          );
        }
      }
    },
    {
      name: 'cancel',
      class: 'Function',
      value: async wizardlet => {
        return wizardlet.capable.getCapablePayloadDAO().remove(
          wizardlet.targetPayload
        );
      }
    }
  ]
});
