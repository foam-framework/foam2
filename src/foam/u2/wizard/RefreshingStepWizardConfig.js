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
      name: 'ifGranted',
      class: 'String'
    },
    {
      name: 'onClose',
      class: 'Function',
      value: function (x) {
        if ( ! this.ifGranted ) {
          window.location.reload();
          return;
        }
        x.crunchService.getJunction(null, this.ifGranted).then(ucj => {
          if ( ucj.status === this.CapabilityJunctionStatus.GRANTED ) {
            window.location.reload();
          }
        });
      }
    }
  ],
})
