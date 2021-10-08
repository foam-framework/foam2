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
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.u2.wizard.ProxyWAO',
    'foam.u2.wizard.WizardletIndicator'
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
        return capability ? capability.id : '';
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
      name: 'isAvailablePromise',
      factory: () => Promise.resolve(),
      hidden: true
    },
    {
      name: 'isAvailable',
      class: 'Boolean',
      value: true,
      postSet: function (ol, nu) {
        if ( nu ) this.isAvailablePromise =
          this.isAvailablePromise.then(() => this.save());
        else this.isAvailablePromise =
          this.isAvailablePromise.then(() => this.cancel());
      }
    },
    {
      name: 'wao',
      hidden: true,
      factory: function () {
        return this.ProxyWAO.create({}, this.__context__);
      }
    },
    {
      name: 'indicator',
      expression: function (status) {
        if (
          status == this.CapabilityJunctionStatus.GRANTED ||
          status == this.CapabilityJunctionStatus.PENDING ||
          status == this.CapabilityJunctionStatus.GRACE_PERIOD
        ) {
          return this.WizardletIndicator.COMPLETED;
        }
        return this.WizardletIndicator.PLEASE_FILL;
      }
    },
    {
      class: 'Boolean',
      name: 'isLoaded',
      documentation: `
        True if CapabilityJunctionData is loaded - currently used only in Capable
      `
    }
  ]
});
