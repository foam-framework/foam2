/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'UserCapabilityJunctionWAO',
  implements: [ 'foam.u2.wizard.WAO' ],
  flags: ['web'],

  requires: [
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  imports: [
    'crunchService'
  ],

  methods: [
    function save(wizardlet) {
      if ( ! wizardlet.isAvailable ) return Promise.resolve();
      return this.crunchService.updateJunction( null,
        wizardlet.capability.id, wizardlet.data, null
      ).then((ucj) => {
        this.crunchService.pub('updateJunction');
        return ucj;
      });
    },
    function cancel(wizardlet) {
      return this.crunchService.updateJunction( null,
        wizardlet.capability.id, null, this.CapabilityJunctionStatus.AVAILABLE
      ).then((ucj) => {
        this.crunchService.pub('updateJunction');
        return ucj;
      });
    },
    function load(wizardlet) {
      return this.crunchService.getJunction(
        null, wizardlet.capability.id
      ).then(ucj => {
        wizardlet.status = ucj.status;

        // No 'of'? No problem
        if ( ! wizardlet.of ) return wizardlet;

        // Load UCJ data to wizardlet
        var loadedData = wizardlet.of.create({}, wizardlet);
        if ( ucj.data ) loadedData.copyFrom(ucj.data);

        // Set transient 'capability' property if it exists
        var prop = wizardlet.of.getAxiomByName('capability');
        if ( prop ) prop.set(loadedData, wizardlet.capability);

        // Finally, apply new data to wizardlet
        wizardlet.data = loadedData;
      });
    }
  ]
});