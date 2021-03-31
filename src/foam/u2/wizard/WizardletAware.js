/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.wizard',
  name: 'WizardletAware',

  documentation: `
    Wizardlet data implementing this interface can override the default method
    of detecting changes. This can be used to reduce the number of saves when
    the model's properties update too frequently.
  `,

  methods: [
    { name: 'getUpdateSlot' },
    { name: 'installInWizardlet' }
  ]
});

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'AbstractWizardletAware',
  implements: [
    {
      path: 'foam.u2.wizard.WizardletAware',
      flags: ['web']
    }
  ],

  requires: [
    'foam.u2.wizard.internal.FObjectRecursionSlot'
  ],

  properties: [
    {
      name: 'customUpdateSlot',
      class: 'Boolean',
      hidden: true,
      transient: true
    }
  ],

  methods: [
    function installInWizardlet(w) {
    },
    function getUpdateSlot() {
      var sl = this.FObjectRecursionSlot.create({ obj: this });
      return sl;
    }
  ]
});
