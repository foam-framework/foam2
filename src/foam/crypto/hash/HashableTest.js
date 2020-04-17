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
            "47f68c52aaae1c2cdad696c59a248752");
        Hashable_HashWithValidAlgorithm(input, "SHA-1",
            "b56f36f495469a97928e664ccff17ea62d7d4d78");
        Hashable_HashWithValidAlgorithm(input, "SHA-256",
            "ec0604d4874bd8f899a9efcb4e05bd2c83f024b16c5ae8b2a99049a5106b8eb6");
        Hashable_HashWithValidAlgorithm(input, "SHA-384",
            "d2f4e706ec2b7b8f2bfd21b1e80c28bb500453d22a11ab4b6be82dd8de03470b1f172e5b80ffda71f7b5f5f170ec2350");
        Hashable_HashWithValidAlgorithm(input, "SHA-512",
            "d6b71a2d9368fac8aba8b285ea489297a55f99e31a6585a19f524fd09b53375d74563040793195f3dbb1eee6e7defff5d03bff569b9962ae06250626f402903a");

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
        } catch (Exception e) {
          test(true, "Hash with invalid algorithm throws NoSuchAlgorithmException");
        } catch (Throwable t) {
        }
      `
    }
  ]
});
