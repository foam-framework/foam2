/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.firebase',
  name: 'DefaultFirestoreData',
  implements: [ 'foam.mlang.F' ],

  documentation: `Modeled default FObject => data-for-firestore
      implementation.`,

  methods: [
    function f(obj) {
      return foam.json.objectify(obj);
    }
  ]
});
