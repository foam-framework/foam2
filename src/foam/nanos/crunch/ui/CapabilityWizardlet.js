/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapabilityWizardlet',
  extends: 'foam.u2.wizard.BaseWizardlet',

  requires: [
    'foam.nanos.crunch.ui.UserCapabilityJunctionWAO',
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
      name: 'isAvailable',
      class: 'Boolean',
      value: true,
      postSet: function (ol, nu) {
        if ( nu ) this.save();
        else this.cancel();
      }
    },
    {
      name: 'dataController',
      factory: function () {
        return this.UserCapabilityJunctionWAO.create({}, this.__context__);
      }
    }
  ]
});
