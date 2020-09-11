/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'BaseWizardlet',

  implements: [
    'foam.u2.wizard.Wizardlet'
  ],

  properties: [
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'title',
      class: 'String'
    },
    {
      flags: ['web'],
      name: 'currentSection',
      transient: true
    },
    {
      name: 'isValid',
      class: 'Boolean',
      expression: function (of, data, currentSection, data$errors_) {
        let sectionErrors = [];
        if ( currentSection && data$errors_ ) {
          sectionErrors = data$errors_.filter(error =>
            currentSection.properties.includes(error[0])
          );
        }

        if ( ! this.of ) return true;
        if ( ( ! data ) || currentSection ? sectionErrors.length > 0 : data$errors_) return false;
        return true;
      }
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
    function validate() {
      return this.isValid;
    },
    function createView(data) {
      return null;
    }
  ]
});
