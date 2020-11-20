/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CheckNoDataAgent',
  documentation: `
    Checks if the capabilities needed (by using crunchService.getGrantPath) all have no
    data (or capability.of == null).

    If no required capabilties have data, then the wizard is not needed to render and the
    required capabilities will be granted.

    This applies to the case where the User already has the Prerequisites to capabilit(ies/y) with no data,
    therefore thee wizard does not need to render and the user should have the capabilit(ies/y) granted
  `,

  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],

  imports: [
    'capabilities',
    'crunchService',
    'endSequence',
    'rootCapability'
  ],

  exports: [
    'submitted'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'submitted'
    }
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    async function execute() {
      var capabilitiesNeeded = await this.crunchService.getGrantPath(null, this.rootCapability.id);

      var shouldOpen = this.shouldOpenCapabilitiesArray(capabilitiesNeeded);

      if ( ! shouldOpen ) {
        var filteredCapabilitiesNeeded = capabilitiesNeeded.filter(capa => {
          return foam.nanos.crunch.Capability.isInstance(capa);
        });
        var updateJunctionPromises = filteredCapabilitiesNeeded.map(capa => {
          return this.crunchService.updateJunction(null, capa.id, null, null);
        })
        
        this.submitted = true;
        this.endSequence();

        return Promise.all(updateJunctionPromises);
      }
    },

    function shouldOpenCapabilitiesArray(array) {
      var shouldOpen = false;
      array.forEach(capa => {
        if ( foam.nanos.crunch.MinMaxCapability.isInstance(capa) ){
          // TODO: need js implementation of MinMaxCapability.getPrereqsChainedStatus
          // and check if that is implied GRANTED then grant the min max too no need for wizard
          shouldOpen = true;
        }

        if ( foam.nanos.crunch.Capability.isInstance(capa) ){
          if (capa.of){
            shouldOpen = true;
          }
        }

        if ( Array.isArray(capa) ){
          shouldOpen = this.shouldOpenCapabilitiesArray(capa) ? true : shouldOpen;
        }
      })

      return shouldOpen;
    }
  ]
});

