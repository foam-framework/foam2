/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.test',
  name: 'CrunchTestSupport',

  requires: [
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  properties: [
    {
      name: 'user',
      documentation: `
        Using this property is discouraged. The user can be obtained from
        context, which is already passed to helper methods.
      `
    },
    {
      name: 'testSection',
      class: 'String',
      value: 'Untitled',
      documentation: `
        This is a state variable used to improve log messages.
      `
    },
    {
      name: 'ignoreList',
      class: 'StringArray'
    },
    {
      name: 'expectedStatuses',
      class: 'Map'
    }
  ],

  methods: [
    async function grantAll(x, capabilityId, opt_test) {
      let grantPath = await x.crunchService.getGrantPath(
        x, capabilityId);
      await this.grantArray(x, grantPath, opt_test);
    },
    async function grantArray(x, capabilities, opt_test) {
      for ( let i = 0 ; i < capabilities.length; i++ ) {
        let capability = capabilities[i];
        if ( Array.isArray(capability) ) {
          await this.grantArray(x, capability, opt_test);
          continue;
        }
        await this.grantCapability(x, capability, opt_test);
      }
    },
    async function grantCapability(x, capability, opt_test) {
      if ( this.ignoreList.includes(capability.id) ) return;

      let expectedStatus = this.expectedStatuses[capability.id] ||
        this.CapabilityJunctionStatus.GRANTED;

      let grantFn = this[this.capabilityIdToSupportMethod(capability.id)];
      // For MinMax capabilities, we may not wish to grant all choices
      if ( ! grantFn ) return;
      let ucj = await grantFn.call(this, x, this.user);
      if ( opt_test ) {
        opt_test(ucj && ucj.status == expectedStatus,
          `${this.testSection} ${capability.name} ${capability.id} ` +
          (ucj && ucj.status));
      }
    },
    function capabilityIdToSupportMethod(capabilityId) {
      return capabilityId.replaceAll(/\.|-/g,'_');
    },
    function addPending(...caps) {
      for ( let cap of caps ) {
        this.expectedStatuses[cap] = this.CapabilityJunctionStatus.PENDING;
      }
    },
    function addActionRequired(...caps){
      for ( let cap of caps ) {
        this.expectedStatuses[cap] = this.CapabilityJunctionStatus.ACTION_REQUIRED;
      }
    },
    function ignore(...caps) {
      this.ignoreList.push(...caps);
    }
  ]
});
