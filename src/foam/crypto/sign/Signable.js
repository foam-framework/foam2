/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.crypto.sign',
  name: 'Signable',

  documentation: 'Signer interface',

  methods: [
    {
      name: 'sign',
      javaReturns: 'byte[]',
      args: [
        {
          name: 'algorithm',
          javaType: 'String',
          documentation: 'Signing algorithm to use'
        },
        {
          name: 'key',
          javaType: 'java.security.PrivateKey',
          documentation: 'Private key to use for signing'
        }
      ]
    }
  ]
});
