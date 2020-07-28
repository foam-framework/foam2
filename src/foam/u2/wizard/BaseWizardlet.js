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
      name: 'isValid',
      class: 'Boolean',
      expression: function (mustBeValid, of, data, data$errors_) {
        if ( ! mustBeValid ) return true;
        if ( ! this.of ) return true;
        if ( ( ! data ) || data$errors_ ) return false;
        return true;
      }
    }
  ],

  methods: [
    function validate() {
      return this.isValid;
    }
  ]
});
