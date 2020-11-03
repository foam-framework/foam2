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
    'localeDAO'
  ],

  properties: [
    // Properties specific to CapabilityWizardSection
    {
      name: 'capability'
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
      flags: ['web'],
      factory: function() {
        if ( ! this.of ) return null;

        var ret = this.of.create({}, this);
        if ( this.ucj && this.ucj.data ) ret = Object.assign(ret, this.ucj.data);

        var prop = this.of.getAxiomByName('capability');
        if ( prop ) prop.set(ret, this.capability);

        return ret;
      }
    },
    {
      name: 'title',
      class: 'String',
      expression: function(capability) {
        if ( ! capability || ! capability.name ) return '';
        return capability.name;
      }
    }
  ],

  methods: [
    {
      name: 'save',
      code: function() {
        return this.crunchController && this.crunchController.save(this);
      }
    }
  ]
});
