/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.firebase',
  name: 'DefaultFObject',
  implements: [ 'foam.mlang.F' ],

  documentation: `Modeled default data-from-firestore => FObject
      implementation.`,

  methods: [
    function f(data) {
      return foam.json.parse(data);
    }
  ]
});
