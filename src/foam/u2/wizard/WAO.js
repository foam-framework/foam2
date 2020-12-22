/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.wizard',
  name: 'WAO',
  label: 'Wizardlet Access Object',
  flags: ['web'],
  documentation: `
    Controls how a wizardlet's data is created, saved, and cancelled. A WAO may
    also set custom properties when passed recognized wizardlet subclasses.
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
