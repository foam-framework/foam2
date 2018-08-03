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
          .setFirstName("Kirk")
          .setLastName("Eaton")
          .setEmail("kirk@nanopay.net")
          .build();

        // non-chained hash with correct digest
        Hashable_HashWithValidAlgorithm(input, "MD5",
            "182c7575cbf3066c4cb3a6dcc85c730d");
        Hashable_HashWithValidAlgorithm(input, "SHA-1",
            "86a6073caf28fa9d825f63aa25796329cc078c6a");
        Hashable_HashWithValidAlgorithm(input, "SHA-256",
            "52f96255f38ea9f675b24bf9def2be4d0cafde0708a69d80ffbe4729ba8d7bb9");
        Hashable_HashWithValidAlgorithm(input, "SHA-384",
            "3bff0582ca5bb5a02744af846616d4d077e016eb5d247577277c2b1f7dd23458091ee8109cabc3df945515f1c510ecf9");
        Hashable_HashWithValidAlgorithm(input, "SHA-512",
            "f66eb6c7a08da83c3ab86f79e2a01958b4d07f6fe82251dfef8b0100e570781ae50a21146cc1a1d58116959d1620dfa1d0f6b5fcf4b8fc230c810f548d145db4");

        // chained hash with correct digest
        Hashable_HashWithValidAlgorithmWithChaining(input, "MD5",
            "182c7575cbf3066c4cb3a6dcc85c730d",
            "f543e264a0b2504de37fe92d8bf40020");
        Hashable_HashWithValidAlgorithmWithChaining(input, "SHA-1",
            "86a6073caf28fa9d825f63aa25796329cc078c6a",
            "07d3bf75f22471ddf2758f184772141a78831cd1");
        Hashable_HashWithValidAlgorithmWithChaining(input, "SHA-256",
            "52f96255f38ea9f675b24bf9def2be4d0cafde0708a69d80ffbe4729ba8d7bb9",
            "386cbae437c04cad2fe8024dd4d5610ca722945016b3fa44b06e698c8e77aed8");
        Hashable_HashWithValidAlgorithmWithChaining(input, "SHA-384",
            "3bff0582ca5bb5a02744af846616d4d077e016eb5d247577277c2b1f7dd23458091ee8109cabc3df945515f1c510ecf9",
            "1e95456b0ae227f15a595b637937cd92a23bac2366655c370b71ffabba435bca561f30bd80285a58502c43932089c5c3");
        Hashable_HashWithValidAlgorithmWithChaining(input, "SHA-512",
            "f66eb6c7a08da83c3ab86f79e2a01958b4d07f6fe82251dfef8b0100e570781ae50a21146cc1a1d58116959d1620dfa1d0f6b5fcf4b8fc230c810f548d145db4",
            "6e39305239e1483a5018ed18c9d01729a0d44413782e5dc645a5bb6437d821b13f5ae49213d73b34e9911f0c0793f6b16489229a32ced4f642686a122e7f3825");

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
        { class: 'FObjectProperty', name: 'input'     },
        { class: 'String',          name: 'algorithm' },
        { class: 'String',          name: 'expected'  }
      ],
      javaCode: `
        try {
          test(Hex.toHexString(input.hash(algorithm, null)).equals(expected),
              "Input hashed using " + algorithm + " produces correct digest of " + expected);
        } catch ( Throwable t ) {
          test(false, "Input hashed using " + algorithm + " should not throw an exception");
        }
      `
    },
    {
      name: 'Hashable_HashingSameObjects_ProducesSameDigest',
      args: [
        { class: 'FObjectProperty', name: 'o1'      },
        { class: 'FObjectProperty', name: 'o2'      },
        { class: 'String',          name: 'message' }
      ],
      javaCode: `
        try {
          String d1 = Hex.toHexString(o1.hash("SHA-256", null));
          String d2 = Hex.toHexString(o2.hash("SHA-256", null));
          test(d1.equals(d2), message);
        } catch ( Throwable t ) {
          test(false, message);
        }
      `
    },
    {
      name: 'Hashable_HashWithValidAlgorithmWithChaining',
      args: [
        { class: 'FObjectProperty', name: 'input'          },
        { class: 'String',          name: 'algorithm'      },
        { class: 'String',          name: 'previousDigest' },
        { class: 'String',          name: 'expected'       }
      ],
      javaCode: `
        try {
          test(Hex.toHexString(input.hash(algorithm, Hex.decode(previousDigest))).equals(expected),
              "Input hashed using " + algorithm + " with chaining produces correct digest of " + expected);
        } catch ( Throwable t ) {
          test(false, "Input hashed using " + algorithm + " with chaining should not throw an exception");
        }
      `
    },
    {
      name: 'Hashable_HashWithInvalidAlgorithm_NoSuchAlgorithmException',
      args: [ { class: 'FObjectProperty', name: 'input' } ],
      javaCode: `
        try {
          input.hash("asldkfjaksdjhf", null);
          test(false, "Hash with invalid algorithm should throw a NoSuchAlgorithmException");
        } catch ( Throwable t ) {
          test(t instanceof NoSuchAlgorithmException, "Hash with invalid algorithm throws NoSuchAlgorithmException");
        }
      `
    }
  ]
});
