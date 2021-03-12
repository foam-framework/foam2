/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'LoadWizardletsAgent',
  documentation: `
    Calls the asynchronous load() method on all wizardlets
    in the context's wizardlets variable.
  `,

  imports: [
    'wizardlets'
  ],

  implements: [
    'foam.core.ContextAgent'
  ],

  methods: [
    async function execute() {
      await Promise.all(this.wizardlets.map(w => w.load()));
    }
  ]
});