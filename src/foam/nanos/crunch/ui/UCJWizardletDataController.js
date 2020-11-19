foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'UCJWizardletDataController',
  extends: 'foam.u2.wizard.WizardletDataController',

  imports: [
    'crunchService'
  ],

  properties: [
    {
      name: 'save',
      class: 'Function',
      value: function (wizardlet) {
        if ( ! wizardlet.isAvailable ) return Promise.resolve();
        return this.crunchService.updateJunction(
          null, wizardlet.capability.id, wizardlet.data, null
        ).then((ucj) => {
          this.crunchService.pub('updateJunction');
          return ucj;
        });
      }
    },
    {
      name: 'cancel',
      class: 'Function',
      value: function (wizardlet) {
        if ( ! wizardlet.isAvailable ) return Promise.resolve();
        return this.crunchService.updateJunction(
          null, wizardlet.capability.id, null, 
        ).then((ucj) => {
          this.crunchService.pub('updateJunction');
          return ucj;
        });
      }
    }
  ]
});