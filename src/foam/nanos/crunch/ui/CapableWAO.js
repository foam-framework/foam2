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
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.ui.CapabilityWizardlet'
  ],

  methods: [
    async function save(wizardlet) {
      if ( wizardlet.isAvailable ){

        if ( wizardlet.status === this.CapabilityJunctionStatus.AVAILABLE ) {
          wizardlet.status = this.CapabilityJunctionStatus.ACTION_REQUIRED;
        }

        return this.capable.getCapablePayloadDAO().put(
          this.makePayload(wizardlet)
        ).then(payload => {
          this.load_(wizardlet, payload);
          if ( wizardlet.isValid ) {
            wizardlet.status = this.CapabilityJunctionStatus.PENDING;
          }
          return payload;
        });
      }
    },
    async function cancel(wizardlet) {
      if ( ! wizardlet.isLoaded ) return;
      return this.capable.getCapablePayloadDAO().remove(
        this.makePayload(wizardlet)
      );
    },
    async function load(wizardlet) {
      var targetPayload = await this.capable.getCapablePayloadDAO().find(
        wizardlet.capability.id ) || this.targetPayload;
      this.load_(wizardlet, targetPayload);
    },
    async function load_(wizardlet, payload) {
      wizardlet.isLoaded = true;

      wizardlet.status = this.CapabilityJunctionStatus.AVAILABLE;

      if ( payload ) wizardlet.status = payload.status;

      // No 'of'? No problem
      if ( ! wizardlet.of ) return;

      // Load CapablePayload data to wizardlet
      var loadedData = wizardlet.of.create({}, wizardlet);
      if ( payload && payload.data )
        loadedData.copyFrom(payload.data);

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
