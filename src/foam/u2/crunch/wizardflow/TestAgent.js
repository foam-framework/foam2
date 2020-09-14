/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'TestAgent',

  implements: [ 'foam.core.ContextAgent' ],

  imports: [
    'capabilities',
    'wizardlets'
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    function execute() {
      // console.log('caps', this.capabilities);
      // console.log('wizs', this.wizardlets);
      return Promise.resolve();
    }
  ]
});

