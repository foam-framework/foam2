/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'SkipGrantedAgent',
  documentation: `
    Allows filtering or skipping of granted capabilities. Also exports a wizard
    position in case wizardlets are to be skipped.
  `,
  imports: [ 'wizardlets' ],
  exports: [ 'initialPosition' ],
  requires: [
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.ui.CapabilityWizardlet',
    'foam.u2.wizard.WizardPosition'
  ],

  enums: [
    {
      name: 'SkipMode',
      values: ['HIDE','SHOW','SKIP']
    }
  ],

  properties: [
    {
      name: 'initialPosition',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.WizardPosition',
      factory: function() {
        return this.WizardPosition.create({
          wizardletIndex: 0,
          sectionIndex: 0,
        });
      },
    },
    {
      name: 'mode',
      factory: function () {
        return this.SkipMode.SKIP;
      }
    }
  ],

  methods: [
    async function execute() {
      if ( this.mode == this.SkipMode.SHOW ) return;

      let passedAtBeginning = 0;
      let foundFirstWizardlet = false;
      for ( let wizardlet of this.wizardlets ) {
        if ( ! this.CapabilityWizardlet.isInstance(wizardlet) ) continue;
        let isGranted = ['GRANTED','PENDING'].some(status =>
          this.CapabilityJunctionStatus[status] == wizardlet.status);
        if ( ! isGranted ) {
          foundFirstWizardlet = true;
          continue;
        }
        if ( ! foundFirstWizardlet ) passedAtBeginning++;
        if ( this.mode == this.SkipMode.HIDE ) wizardlet.isAvailable = false;
      }

      this.initialPosition.wizardletIndex = passedAtBeginning;
    }
  ],
});
