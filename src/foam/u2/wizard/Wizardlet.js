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
      class: 'Class',
      documentation: `
        Specifies a class for the wizardlet's 'data' property. This value can
        be null to indicate that the wizardlet doesn't have any data.
      `,
    },
    {
      name: 'data',
      documentation: `
        This is the data that will be saved by the wizardlet. If this is null,
        the wizardlet may still provide a side-effect when save is called.
      `
    },
    {
      name: 'title',
      class: 'String',
      documentation: `
        Specifies a human-friendly name for this wizardlet.
      `
    },
    {
      name: 'isAvailable',
      class: 'Boolean',
      value: true,
      documentation: `
        Specify the availability of this wizardlet. Wizardlet availability
        indicates that the wizardlet is allowed to be saved, or otherwise affect
        the wizard. This is independent from visibility.
      `
    },
    {
      name: 'isVisible',
      class: 'Boolean',
      value: true,
      documentation: `
        Specify the visibility of this wizardlet. If true, wizardlet is
        visible iff at least one section is available. If false, the wizardlet
        does not display even if some sections are available.
      `
    }
  ],

  methods: [
    {
      flags: ['web'],
      name: 'save',
      async: true,
      args: [
        { name: 'options', type: 'Object' }
      ],
      documentation: `
        Convey an intent to save this wizardlet. The destination will depend on
        the subclass of wizardlet, or a provided WAO.

        This method takes arguments in the form of a plain object. The following
        properties will affect how the wizardlet is saved:

        - **disposable**: If true, this save should be ignored during an
          ongoing operation. If false or unspecified, this save should be
          enqueued during an ongoing operation.
        - **reloadData**: If true, the wizardlet will reload data from the
          server after saving. This should be used sparingly, as an expected
          reload blocks user input to prevent data loss.
      `
    },
    {
      flags: ['web'],
      name: 'cancel',
      async: true,
      documentation: `
        This will be called when a wizardlet is no longer needed. For example,
        if the wizardlet was related to a choice which the user de-selected.

        This method is not to be disposable, and will not invoke a reload.
      `
    },
    {
      flags: ['web'],
      name: 'createView',
      documentation: `
        This method is deprecated. Please use 'createView' in WizardletSection
        instead.
      `,
      args: [
        {
          name: 'data'
        }
      ]
    }
  ]
});
