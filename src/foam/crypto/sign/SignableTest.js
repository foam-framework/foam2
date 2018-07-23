/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.crypto.sign',
  name: 'SignableTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'org.bouncycastle.jce.provider.BouncyCastleProvider',
    'foam.nanos.auth.User',
    'java.security.*',
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            static {
              // add bouncy castle provider
              BouncyCastleProvider provider = new BouncyCastleProvider();
              if ( Security.getProvider(provider.getName()) == null ) {
                Security.addProvider(provider);
              }
            }
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        KeyPair keypair = null;
        User input = new User.Builder(x)
          .setId(1000)
          .setFirstName("Kirk")
          .setLastName("Eaton")
          .setEmail("kirk@nanopay.net")
          .build();

        try {
          KeyPairGenerator keygen = KeyPairGenerator.getInstance("RSA");
          keygen.initialize(1024);
          keypair = keygen.generateKeyPair();
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }

        // sign with invalid algorithm
        Signable_SignWithInvalidAlgorithm_NoSuchAlgorithmException(input);

        // sign with null private key
        Signable_SignWithNullPrivateKey_InvalidKeyException(input);

        // sign with algorithm and private key mismatch
        Signable_SignWithMismatchedAlgorithmAndKey_InvalidKeyException(input, "SHA256withECDSA", keypair.getPrivate());
      `
    },
    {
      name: 'Signable_SignWithValidAlgorithm',
      args: [
        { class: 'FObjectProperty', name: 'input'     },
        { class: 'String',          name: 'algorithm' },
        { class: 'Object',          name: 'key'       }
      ],
      javaCode: `
        return;
      `
    },
    {
      name: 'Signable_SignWithInvalidAlgorithm_NoSuchAlgorithmException',
      args: [ { class: 'FObjectProperty', name: 'input' } ],
      javaCode: `
        try {
          input.sign("asdfghjkl", null);
          test(false, "Signing with invalid algorithm should throw a NoSuchAlgorithmException");
        } catch ( Throwable t ) {
          test(t instanceof NoSuchAlgorithmException, "Sign with invalid algorithm throws NoSuchAlgorithmException");
        }
      `
    },
    {
      name: 'Signable_SignWithNullPrivateKey_InvalidKeyException',
      args: [
        { class: 'FObjectProperty', name: 'input' }
      ],
      javaCode: `
        try {
          input.sign("SHA256withRSA", null);
          test(false, "Signing with a null key should throw an InvalidKeyException");
        } catch ( Throwable t ) {
          test(t instanceof InvalidKeyException, "Sign with null key throws InvalidKeyException");
        }
      `
    },
    {
      name: 'Signable_SignWithMismatchedAlgorithmAndKey_InvalidKeyException',
      args: [
        { class: 'FObjectProperty', name: 'input'     },
        { class: 'String',          name: 'algorithm' },
        { class: 'Object',          name: 'key'       }
      ],
      javaCode: `
        try {
          input.sign(algorithm, (PrivateKey) key);
        } catch ( Throwable t ) {
          test(t instanceof InvalidKeyException, "Sign with mismatched algorithm and key throws InvalidKeyException");
        }
      `
    }
  ]
});
