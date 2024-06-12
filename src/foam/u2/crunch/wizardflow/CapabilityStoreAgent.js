/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CapabilityStoreAgent',
  flags: ['web'],
  documentation: `
    This agent publishes to topics used to update capability store entries.
  `,

  imports: [
    'rootCapability',
    'crunchService'
  ],

  requires: [
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  methods: [
    async function execute() {
      let ucj = await this.crunchService.getJunction(null, this.rootCapability.id);
      this.crunchService.pub('updateJunction');
      if ( ucj && ucj.status === this.CapabilityJunctionStatus.GRANTED ) {
        this.crunchService.pub('grantedJunction');
      }
    }
  ]
});
