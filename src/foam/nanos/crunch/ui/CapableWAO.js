/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapableWAO',
  implements: [ 'foam.u2.wizard.WAO' ],
  flags: ['web'],

  imports: [
    'capable',
    'crunchService'
  ],

  requires: [
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.ui.CapabilityWizardlet'
  ],

  methods: [
    async function save(wizardlet) {
      if ( wizardlet.isAvailable ){
        return this.capable.getCapablePayloadDAO().put(
          this.makePayload(wizardlet)
        );
      }
    },
    async function cancel(wizardlet) {
      return this.capable.getCapablePayloadDAO().remove(
        this.makePayload(wizardlet)
      );
    },
    async function load(wizardlet) {
      var targetPayload = await this.capable.getCapablePayloadDAO().find(
        wizardlet.capability) || this.targetPayload;

      if ( targetPayload ) wizardlet.status = targetPayload.status;

      // No 'of'? No problem
      if ( ! wizardlet.of ) return;

      // Load CapablePayload data to wizardlet
      var loadedData = wizardlet.of.create({}, wizardlet);
      if ( targetPayload && targetPayload.data )
        loadedData.copyFrom(targetPayload.data);

      // Set transient 'capability' property if it exists
      var prop = wizardlet.of.getAxiomByName('capability');
      if ( prop ) prop.set(loadedData, wizardlet.capability);

      // Finally, apply new data to wizardlet
      wizardlet.data = loadedData;
    },
    function makePayload(wizardlet) {
      return this.CapabilityJunctionPayload.create({
        capability: wizardlet.capability,
        data: wizardlet.data
      });
    }
  ]
});
