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
            "d41d8cd98f00b204e9800998ecf8427e");
        Hashable_HashWithValidAlgorithm(input, "SHA-1",
            "da39a3ee5e6b4b0d3255bfef95601890afd80709");
        Hashable_HashWithValidAlgorithm(input, "SHA-256",
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        Hashable_HashWithValidAlgorithm(input, "SHA-384",
            "38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b");
        Hashable_HashWithValidAlgorithm(input, "SHA-512",
            "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e");

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
          String produced = Hex.toHexString(input.hash(algorithm));
          test(produced.equals(expected),
              "Input hashed algorithm: " + algorithm + ", produced: "+produced+ ", expected: "+expected);
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
