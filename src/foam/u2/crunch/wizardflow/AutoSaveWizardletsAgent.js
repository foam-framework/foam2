/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'AutoSaveWizardletsAgent',

  implements: [
    'foam.core.ContextAgent',
  ],

  imports: [
    'wizardlets',
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    async function execute() {
      for ( let wizardlet of this.wizardlets ) if ( wizardlet.of ) {
        wizardlet.getDataUpdateSub().sub(() => {
          wizardlet.save();
        });
      }
    }
  ]
});
