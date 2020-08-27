/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapabilityWizardlet',
  extends: 'foam.u2.wizard.BaseWizardlet',

  imports: [
    'crunchController'
  ],

  requires: [
    'foam.core.Action',
    'foam.core.Property',
    'foam.layout.Section',
    'foam.layout.SectionAxiom'
  ],

  properties: [
    // Properties specific to CapabilityWizardSection
    {
      name: 'capability'
    },
    {
      name: 'ucj'
    },

    // Properties for WizardSection interface
    {
      name: 'of',
      class: 'Class',
      expression: function(capability) {
        return capability && capability.of;
      }
    },
    {
      name: 'data',
      factory: function() {
        if ( ! this.of ) return null;

        var ret = this.of.getAxiomByName('capability') ?
          this.of.create({ capability: this.capability }, this) :
          this.of.create({}, this);

        if ( this.ucj === null ) return ret;
      
        ret = Object.assign(ret, this.ucj.data);
        return ret;
      }
    },
    {
      name: 'title',
      expression: function(capability) {
        return capability && capability.name;
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
