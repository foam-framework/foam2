/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CheckNoDataAgent',

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
      var shouldOpen = false;

      await this.crunchService.getGrantPath(null, this.rootCapability.id).then(capabilitiesNeeded => {
        capabilitiesNeeded.forEach(capa => {
          if ( capa.of ){
            shouldOpen = true;
          }
        })

        if ( ! shouldOpen ) {
          var updateJunctionPromises = capabilitiesNeeded.map(capa => {
            return this.crunchService.updateJunction(null, capa.id, null, null);
          })
          
          this.submitted = true;
          this.endSequence();
  
          return Promise.all(updateJunctionPromises);
        }
      })
    }
  ]
});

