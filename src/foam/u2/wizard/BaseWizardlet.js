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

  methods: [
    {
      name: 'readyToSubmit',
      code: function () {
        // Always return true if `of` is falsy; this implies there is no data to validate
        if ( ! this.of ) return true;
        if ( ! this.data || this.data.errors_ ) return false;
        return true;
      }
    }
  ]
});
