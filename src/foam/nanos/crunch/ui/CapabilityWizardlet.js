/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapabilityWizardlet',
  extends: 'foam.u2.wizard.BaseWizardlet',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'crunchController',
    'crunchService',
    'localeDAO'
  ],

  requires: [
    'foam.nanos.crunch.ui.UCJWizardletDataController',
  ],

  properties: [
    // Properties specific to CapabilityWizardSection
    {
      name: 'capability'
    },
    {
      name: 'status'
    },
    {
      name: 'ucj'
    },
    {
      name: 'id',
      expression: function (capability) {
        return 'capability,' + capability.id;
      }
    },

    // Properties for WizardSection interface
    {
      name: 'of',
      class: 'Class',
      expression: function(capability) {
        if ( ! capability || ! capability.of ) return null;
        return capability.of;
      }
    },
    {
      name: 'data',
      flags: ['web']
    },
    {
      name: 'title',
      class: 'String',
      expression: function(capability) {
        if ( ! capability || ! capability.name ) return '';
        return capability.name;
      }
    },
    {
      name: 'dataController',
      factory: function () {
        return this.UCJWizardletDataController.create();
      }
    }
  ]
});
