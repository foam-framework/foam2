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
      returns: 'ByteArray',
      javaThrows: [
        'java.security.NoSuchAlgorithmException',
        'java.security.InvalidKeyException',
        'java.security.SignatureException'
      ],
      args: [
        {
          name: 'algorithm',
          type: 'String',
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
          type: 'ByteArray',
          documentation: 'Signature to verify'
        },
        {
          name: 'algorithm',
          type: 'String',
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
