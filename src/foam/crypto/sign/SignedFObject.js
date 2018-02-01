/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.crypto.sign',
  name: 'SignedFObject',

  documentation: 'Represents an FObject with it\'s signature',

  properties: [
    {
      class: 'FObjectProperty',
      name: 'data',
      documentation: 'Original object'
    },
    {
      class: 'String',
      name: 'signature',
      documentation: 'Signature of object'
    }
  ]
});
