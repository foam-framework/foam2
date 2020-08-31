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
      name: 'mustBeValid',
      class: 'Boolean'
    },
    {
      name: 'currentSection',
      transient: true
    },
    {
      name: 'isValid',
      class: 'Boolean',
      expression: function (mustBeValid, of, data, currentSection, data$errors_) {
        let sectionErrors = [];
        if ( currentSection && data$errors_ ) {
          sectionErrors = data$errors_.filter(error =>
            currentSection.properties.includes(error[0])
          );
        }

        if ( ! mustBeValid ) return true;
        if ( ! this.of ) return true;
        if ( ( ! data ) || currentSection ? sectionErrors.length > 0 : data$errors_) return false;
        return true;
      }
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
