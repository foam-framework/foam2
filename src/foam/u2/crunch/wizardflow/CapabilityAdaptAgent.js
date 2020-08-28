/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CapabilityAdaptAgent',
  documentation: `
    If rootCapability in context is a string, then replace it with the real
    Capability object from capabilityDAO.
  `,

  implements: [ 'foam.core.ContextAgent' ],

  imports: [
    'rootCapability as unadaptedRootCapability',
    'capabilityDAO'
  ],
  exports: [ 'rootCapability' ],

  properties: [
    {
      name: 'rootCapability',
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.Capability'
    }
  ],

  methods: [
    async function execute() {
      if ( typeof this.unadaptedRootCapability == 'string' ) {
        this.rootCapability =
          await this.capabilityDAO.find(this.unadaptedRootCapability);
        return;
      }
      this.rootCapability = this.unadaptedRootCapability;
    }
  ],
});