/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'SubmitWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',

  properties: [
    ['isVisible', false],
    {
      name: 'of',
      value: 'foam.core.BooleanHolder'
    },
    {
      name: 'sections',
      factory: function () {
        return [];
      }
    },
    {
      name: 'isValid',
      expression: function (data) {
        return this.data && this.data.value;
      }
    }
  ],

  actions: [
    {
      class: 'foam.u2.wizard.axiom.WizardAction',
      name: 'submit',
      code: function (x) {
        this.data.value = true;
      }
    }
  ]
});
