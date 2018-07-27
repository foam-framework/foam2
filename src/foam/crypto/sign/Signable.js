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
      javaThrows: [
        'java.security.NoSuchAlgorithmException',
        'java.security.InvalidKeyException',
        'java.security.SignatureException'
      ],
      args: [
        {
          name: 'algorithm',
          javaType: 'String',
          documentation: 'Signing algorithm'
        },
        {
          name: 'key',
          javaType: 'java.security.PrivateKey',
          documentation: 'Private key to use for signing'
        }
      ]
    },
    {
      name: 'verify',
      javaReturns: 'boolean',
      javaThrows: [
        'java.security.NoSuchAlgorithmException',
        'java.security.InvalidKeyException',
        'java.security.SignatureException'
      ],
      args: [
        {
          name: 'signature',
          javaType: 'byte[]',
          documentation: 'Signature to verify'
        },
        {
          name: 'algorithm',
          javaType: 'String',
          documentation: 'Signing algorithm'
        },
        {
          name: 'key',
          javaType: 'java.security.PublicKey',
          documentation: 'Public key to use for verifying'
        }
      ]
    }
  ]
});
