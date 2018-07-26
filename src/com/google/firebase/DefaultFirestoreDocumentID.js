/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.firebase',
  name: 'DefaultFirestoreDocumentID',
  implements: [ 'foam.mlang.F' ],

  documentation: `Modeled default FObject => firestore-document-id
      implementation.`,

  properties: [
    {
      class: 'String',
      name: 'slashReplacement',
      value: String.fromCharCode(0),
    }
  ],

  methods: [
    function f(obj) {
      return obj.id.toString().replace(/[/]/g, this.slashReplacement);
    }
  ]
});
