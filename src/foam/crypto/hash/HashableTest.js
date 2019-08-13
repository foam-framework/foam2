/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.crypto.hash',
  name: 'HashableTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.nanos.auth.User',
    'org.bouncycastle.util.encoders.Hex',
    'java.security.NoSuchAlgorithmException'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        User input = new User.Builder(x)
          .setId(1000)
          .setFirstName("Foam")
          .setLastName("Test")
          .setEmail("test@foam.net")
          .build();

        // non-chained hash with correct digest
        Hashable_HashWithValidAlgorithm(input, "MD5",
            "6a6e70ca62d7e0afbde550202cf27bae");
        Hashable_HashWithValidAlgorithm(input, "SHA-1",
            "8ff96b7d123909fe97ecbdfc40059f43d06cb52a");
        Hashable_HashWithValidAlgorithm(input, "SHA-256",
            "9d4aa9f2ed968ba8a1b16bfbc4242a4d9f64df358ca11be051fd80c322c2ffff");
        Hashable_HashWithValidAlgorithm(input, "SHA-384",
            "fd6d5cbb17477742f4b4680d0d5f17940d7c180d56313d6570947f1674e2f0f04c9721e5af0383192d9e6dde7690e0b4");
        Hashable_HashWithValidAlgorithm(input, "SHA-512",
            "1d033a412e9db056510d5a5421bcb576e4feb9a9b7dba88e5c90ab396cb2e4f31028d7e00a8c0422b683de7ba2f309b7a898e9b761817f7e674670710f8ea5b6");

        // hashing same objects produces same digest
        Hashable_HashingSameObjects_ProducesSameDigest(input, input,
            "Hashing the same object produces the same digest");
        Hashable_HashingSameObjects_ProducesSameDigest(input.fclone(), input,
            "Hashing the same object where the first object is fcloned produces the same digest");
        Hashable_HashingSameObjects_ProducesSameDigest(input, input.fclone(),
            "Hashing the same object where the second object is fcloned produces the same digest");
        Hashable_HashingSameObjects_ProducesSameDigest(input.fclone(), input.fclone(),
            "Hashing the same object where both objects are fcloned produces the same digest");

        // hash with invalid algorithm
        Hashable_HashWithInvalidAlgorithm_NoSuchAlgorithmException(input);
      `
    },
    {
      name: 'Hashable_HashWithValidAlgorithm',
      args: [
        { type: 'FObject', name: 'input'     },
        { type: 'String',          name: 'algorithm' },
        { type: 'String',          name: 'expected'  }
      ],
      javaCode: `
        try {
          test(Hex.toHexString(input.hash(algorithm)).equals(expected),
              "Input hashed using " + algorithm + " produces correct digest of " + expected);
        } catch ( Throwable t ) {
          test(false, "Input hashed using " + algorithm + " should not throw an exception");
        }
      `
    },
    {
      name: 'Hashable_HashingSameObjects_ProducesSameDigest',
      args: [
        { type: 'FObject', name: 'o1'      },
        { type: 'FObject', name: 'o2'      },
        { type: 'String',          name: 'message' }
      ],
      javaCode: `
        try {
          String d1 = Hex.toHexString(o1.hash("SHA-256"));
          String d2 = Hex.toHexString(o2.hash("SHA-256"));
          test(d1.equals(d2), message);
        } catch ( Throwable t ) {
          test(false, message);
        }
      `
    },
    {
      name: 'Hashable_HashWithInvalidAlgorithm_NoSuchAlgorithmException',
      args: [ { type: 'FObject', name: 'input' } ],
      javaCode: `
        try {
          input.hash("asldkfjaksdjhf");
          test(false, "Hash with invalid algorithm should throw a NoSuchAlgorithmException");
        } catch ( Throwable t ) {
          test(t instanceof NoSuchAlgorithmException, "Hash with invalid algorithm throws NoSuchAlgorithmException");
        }
      `
    }
  ]
});
