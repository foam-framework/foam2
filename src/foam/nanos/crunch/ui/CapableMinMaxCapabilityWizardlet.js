/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapableMinMaxCapabilityWizardlet',
  extends: 'foam.nanos.crunch.ui.MinMaxCapabilityWizardlet',

  properties: [
    {
      name: 'choices',
      expression: function(choiceWizardlets){
        return choiceWizardlets.map(wizardlet => {

          var isFinal = wizardlet.targetPayload.status !== null &&
            (
              wizardlet.targetPayload.status === this.CapabilityJunctionStatus.GRANTED ||
              wizardlet.targetPayload.status === this.CapabilityJunctionStatus.PENDING
            );

          return [wizardlet.title, wizardlet.title, isFinal ? true : wizardlet.isAvailable$, isFinal ?  foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW, isFinal]
        })
      }
    }
  ]
});
