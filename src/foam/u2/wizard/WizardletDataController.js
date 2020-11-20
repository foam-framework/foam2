/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.wizard',
  name: 'WizardletDataController',
  documentation: `
    Controls how a wizardlet's data is created, saved, and cancelled.

    If an interface is created, it should take on the name of this model, and
    this model should be renamed to CallbackWizardletDataController.
  `,

  methods: [
    {
      name: 'save',
      async: true
    },
    {
      name: 'cancel',
      async: true
    },
    {
      name: 'load',
      async: true
    }
  ]
});
