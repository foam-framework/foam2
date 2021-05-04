/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CheckRootIdAgent',

  documentation: `
    Terminates the sequence here if it was invoked by one of the specified
    capabilities.
  `,

  imports: [
    'rootCapability',
    'sequence'
  ],

  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'rootIdsBlacklist',
      factory: function(){
        return [
          '554af38a-8225-87c8-dfdf-eeb15f71215f-20'
        ]
      }
    }
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    async function execute() {
      if ( this.rootIdsBlacklist.includes(this.rootCapability.id) ) {
        this.sequence.endSequence();
        return;
      }
    }
  ]
});
