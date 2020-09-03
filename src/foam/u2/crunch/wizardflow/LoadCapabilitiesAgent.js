/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'LoadCapabilitiesAgent',

  implements: [ 'foam.core.ContextAgent' ],

  imports: [
    'crunchService',
    'rootCapability'
  ],
  exports: [ 'capabilities' ],

  properties: [
    {
      name: 'capabilities',
      class: 'Array'
    }
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    function execute() {
      return this.crunchService.getCapabilityPath(null, this.rootCapability.id, false)
        .then(capabilities => { this.capabilities = capabilities });
    }
  ]
});
