/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.wizard',
  name: 'Wizardlet',

  properties: [
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'data'
    },
    {
      name: 'title',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'save'
    },
    {
      name: 'readyToSubmit',
      type: 'boolean'
    }
  ]
});
