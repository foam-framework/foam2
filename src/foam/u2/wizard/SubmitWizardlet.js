/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'SubmitWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',

  imports: [
    'wizardlets'
  ],

  properties: [
    ['isVisible', false],
    {
      name: 'of',
      value: 'foam.core.RequiredBooleanHolder'
    },
    {
      name: 'sections',
      factory: function () {
        return [];
      }
    },
    {
      name: 'isValid',
      value: true
    }
  ],

  actions: [
    {
      class: 'foam.u2.wizard.axiom.WizardAction',
      name: 'submit',
      code: function (x) {
        let availableWizardlets = this.wizardlets.filter(w => w.isAvailable);
        for ( let i in availableWizardlets ) {
          if ( ! availableWizardlets[i].isValid ) return;
        }
        this.data.value = true;
      }
    }
  ]
});
