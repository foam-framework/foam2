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
    { name: 'getUpdateSlot' }
  ]
});
