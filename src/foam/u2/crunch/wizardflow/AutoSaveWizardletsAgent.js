/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'AutoSaveWizardletsAgent',
  documentation: `
    Binds listeners which automatically save wizardlets when they are modified.
  `,

  imports: [
    'wizardlets'
  ],

  implements: [
    'foam.core.ContextAgent'
  ],

  methods: [
    async function execute() {
      // TODO: investigate adding onDetach here
      for ( let wizardlet of this.wizardlets ) {
        wizardlet.getDataUpdateSub().sub(() => {
          wizardlet.save({ reloadData: false });
        })
      }
    }
  ]
});
