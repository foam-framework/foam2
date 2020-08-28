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
    },
    {
      name: 'isAvailable',
      class: 'Boolean',
      value: true,
      documentation: `
        Specify the availability of this wizardlet. If true, wizardlet is
        available iff at least one section is available. If false, wizardlet
        does not display even if some sections are available.
      `,
    }
  ],

  methods: [
    {
      name: 'save'
    },
    {
      name: 'createView',
      args: [
        {
          name: 'data'
        }
      ]
    }
  ]
});
