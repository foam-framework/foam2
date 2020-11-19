foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'WizardletDataController',
  documentation: `
    Controls how a wizardlet's data is created, saved, and cancelled.

    If an interface is created, it should take on the name of this model, and
    this model should be renamed to CallbackWizardletDataController.
  `,

  properties: [
    {
      name: 'save',
      class: 'Function',
      value: () => {}
    },
    {
      name: 'cancel',
      class: 'Function',
      value: () => {}
    },
    {
      name: 'load',
      class: 'Function',
      value: () => {}
    }
  ]
});