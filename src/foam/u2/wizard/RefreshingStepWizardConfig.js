/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'RefreshingStepWizardConfig',
  extends: 'foam.u2.wizard.StepWizardConfig',

  requires: [
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  properties: [
    {
      name: 'onClose',
      class: 'Function',
      value: function (x, ucj) {
        if ( ucj.status === this.CapabilityJunctionStatus.GRANTED ) {
          window.location.reload();
        }
      }
    }
  ],
})
