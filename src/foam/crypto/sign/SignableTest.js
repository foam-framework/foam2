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
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'org.bouncycastle.jce.provider.BouncyCastleProvider',
    'org.bouncycastle.util.encoders.Base64',
    'org.bouncycastle.util.encoders.Hex',

    'java.security.*',
    'java.security.spec.PKCS8EncodedKeySpec',
    'java.security.spec.X509EncodedKeySpec'
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

  constants: [
    {
      name: 'RSA_PRIVATE_KEY',
      documentation: 'RSA 4096 private key',
      type: 'String',
      value: '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'
    },
    {
      name: 'RSA_PUBLIC_KEY',
      documentation: 'RSA 4096 public key',
      type: 'String',
      value: 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAmIZvcbNPYsCMgaNRA+vDPtaQmaTwlK1rV5ujoX8RCDhpryj9R+tT5wgHT/aZg3VlvfdhnuXU5ffHp/3mcDLywL6/yQ+CtN2nlwV4/PZfePUpJGhS/+wmvNcpiRz2Lt11jH+fegJa0Io9QGsncrqmYCmIkOkrERcNN1V6pmmKhfsuhnJzIUQRyYh8+V7VY5u9McLviW7SKvw9x2IdYyJ/Ov7ktvHTzBCRivIBRd+MKQ15CZ9PvmAMHv086kEEWTLCFk8ICmVhnSzlvMDZCa+GKeZ/gFYPyxln5OD/xjxsKtpPukZTHMkYsonPc9H2Bs/YJB/zqMBIPCyz45q9fz9JvkPKHSaIXFDhQCGRWkJtG+uZX8Efp9swPKd0jXWWFEDreSGXjtTBUNrQjT5yWXxQse6P7IXmXeD8rhj26eR5Wb/GKt65DSWS7lHMHQwEudTi9ldQpk0JawSHwMSoF3S2pJJYzbAAPuYJqGsIs0ednJM3+G52gI5HVKTXvKmCpT+oPA/os8XrnzvJaAYJi/VktEZuRe+F3hURl0ppcArjDHgAeLYf7fl8kI/qElBHyKoWn56h//xJsQdGslqXRQ3VVA7wzkgm3TLAVNWhzvbUW/6SLCI/WUbR2m8z04Oi0oB2eXGOw1jUfokyMie1vcD//mBJX1NMTj47snnw5HbmOT8CAwEAAQ=='
    },
    {
      name: 'ECDSA_PRIVATE_KEY',
      documentation: 'ECDSA private key',
      type: 'String',
      value: 'MIH3AgEAMBAGByqGSM49AgEGBSuBBAAjBIHfMIHcAgEBBEIA/5NXupegNi4+T7D7yEb4fE8ipLnasyoWOo2ippURQC9oMPtF4k/JhqdCh2kdorYthmf9ANcAZAUKWJ7S0DETQ3GgBwYFK4EEACOhgYkDgYYABAAQDu9DO0C6ILRIsJFwxeycH3vWxxzuvMYu2VFjWq9WCiU3aUr1VF+WytSepXzvuCU7+E1aYPhp8AIHabQ7ZMzMOAE7Pm54YJzvnO2KASQWJm/W78QfgyH5US4Mze/LGNjsgQ1IwtDKeIef/QE1E/99gsoRJ7jkbeTOTgokUorYmMkzXg=='
    },
    {
      name: 'ECDSA_PUBLIC_KEY',
      documentation: 'ECDSA public key',
      type: 'String',
      value: 'MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAEA7vQztAuiC0SLCRcMXsnB971scc7rzGLtlRY1qvVgolN2lK9VRflsrUnqV877glO/hNWmD4afACB2m0O2TMzDgBOz5ueGCc75ztigEkFiZv1u/EH4Mh+VEuDM3vyxjY7IENSMLQyniHn/0BNRP/fYLKESe45G3kzk4KJFKK2JjJM14='
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        User input = new User.Builder(x)
          .setId(1000)
          .setFirstName("Test")
          .setLastName("Foam")
          .setEmail("test@foam.net")
          .build();

        // sign with invalid algorithm
        Signable_SignWithInvalidAlgorithm_NoSuchAlgorithmException(input);

        // sign with null private key
        Signable_SignWithNullPrivateKey_InvalidKeyException(input);

        try {
          KeyFactory factory = KeyFactory.getInstance("RSA");
          PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(Base64.decode(RSA_PRIVATE_KEY));
          PrivateKey privateKey = factory.generatePrivate(privateKeySpec);

          X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(Base64.decode(RSA_PUBLIC_KEY));
          PublicKey publicKey = factory.generatePublic(publicKeySpec);

          // sign using RSA private key
          String SHA1withRSA    = Signable_SignWithValidAlgorithmAndKey(input, "SHA1withRSA", privateKey);
          String SHA256withRSA  = Signable_SignWithValidAlgorithmAndKey(input, "SHA256withRSA", privateKey);
          String SHA384withRSA  = Signable_SignWithValidAlgorithmAndKey(input, "SHA384withRSA", privateKey);
          String SHA512withRSA  = Signable_SignWithValidAlgorithmAndKey(input, "SHA512withRSA", privateKey);

          // verify using RSA public key
          System.out.println(SHA1withRSA);
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA1withRSA", publicKey, SHA1withRSA);
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA256withRSA", publicKey, SHA256withRSA);              
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA384withRSA", publicKey, SHA384withRSA);
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA512withRSA", publicKey, SHA512withRSA);

          // sign with algorithm and private key mismatch
          Signable_SignWithMismatchedAlgorithmAndKey_InvalidKeyException(input, "SHA256withECDSA", privateKey);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }

        try {
          KeyFactory factory = KeyFactory.getInstance("ECDSA");
          PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(Base64.decode(ECDSA_PRIVATE_KEY));
          PrivateKey privateKey = factory.generatePrivate(privateKeySpec);

          X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(Base64.decode(ECDSA_PUBLIC_KEY));
          PublicKey publicKey = factory.generatePublic(publicKeySpec);

          // sign using ECDSA private key
          String SHA1withECDSA    = Signable_SignWithValidAlgorithmAndKey(input, "SHA1withECDSA", privateKey);
          String SHA256withECDSA  = Signable_SignWithValidAlgorithmAndKey(input, "SHA256withECDSA", privateKey);
          String SHA384withECDSA  = Signable_SignWithValidAlgorithmAndKey(input, "SHA384withECDSA", privateKey);
          String SHA512withECDSA  = Signable_SignWithValidAlgorithmAndKey(input, "SHA512withECDSA", privateKey);

          // verify using ECDSA public key
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA1withECDSA", publicKey, SHA1withECDSA);
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA256withECDSA", publicKey, SHA256withECDSA);
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA384withECDSA", publicKey, SHA384withECDSA);
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA512withECDSA", publicKey, SHA512withECDSA);

          // sign with algorithm and private key mismatch
          Signable_SignWithMismatchedAlgorithmAndKey_InvalidKeyException(input, "SHA256withRSA", privateKey);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'Signable_SignWithValidAlgorithmAndKey',
      type: 'String',
      args: [
        { name: 'input', type: 'FObject' },
        { name: 'algorithm', type: 'String' },
        { name: 'key', type: 'Any' }
      ],
      javaCode: `
        String signature = null;
        try {
          signature = Hex.toHexString(input.sign(algorithm, (PrivateKey) key));
          test(! SafetyUtil.isEmpty(signature),
              "Input signed using " + algorithm + " produces correct signature");
          
        } catch ( Throwable t ) {
          test(false, "Input signed using " + algorithm + " should not throw an exception");
        }
        return signature;
      `
    },
    {
      name: 'Signable_VerifyWithValidAlgorithmSignatureAndKey',
      args: [
        { name: 'input', type: 'FObject' },
        { name: 'algorithm', type: 'String' },
        { name: 'key', type: 'Any' },
        { name: 'signature', type: 'String' }
      ],
      javaCode: `
        try {
          test(input.verify(Hex.decode(signature), algorithm, (PublicKey) key), "Input verified using " + algorithm);
        } catch ( Throwable t ) {
          test(false, "Input verified using " + algorithm + " should not thrown an exception");
        }
      `
    },
    {
      name: 'Signable_SignWithInvalidAlgorithm_NoSuchAlgorithmException',
      args: [ { type: 'FObject', name: 'input' } ],
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
        { type: 'FObject', name: 'input' }
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
        { type: 'FObject', name: 'input'     },
        { type: 'String', name: 'algorithm' },
        { type: 'Any', name: 'key'       }
      ],
      javaCode: `
        try {
          input.sign(algorithm, (PrivateKey) key);
          test(false, "Sign with mismatched algorithm and key throws InvalidKeyException");
        } catch ( Throwable t ) {
          test(t instanceof InvalidKeyException, "Sign with mismatched algorithm and key throws InvalidKeyException");
        }
      `
    }
  ]
});
