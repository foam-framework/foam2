/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapableObjectWizardlet',
  extends: 'foam.u2.wizard.BaseWizardlet',

  imports: [
    'capable',
    'crunchController'
  ],

  requires: [
    'foam.nanos.crunch.ui.CapableWizardletDataController'
  ],

  properties: [
    // Properties specific to CapabilityWizardSection
    {
      name: 'capability'
    },
    {
      name: 'id',
      expression: function (capability) {
        return 'capability,' + capability.id;
      }
    },
    {
      name: 'targetPayload',
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.lite.CapablePayload'
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
      factory: function () {
        if ( ! this.of ) return null;

        return this.of.getAxiomByName('capability') ?
          this.of.create({ capability: this.capability }, this) :
          this.of.create({}, this);
      }
    },
    {
      name: 'title',
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
        return this.CapableWizardletDataController.create();
      }
    }
  ]
});

