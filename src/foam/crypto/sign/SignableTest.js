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
          Signable_SignWithValidAlgorithmAndKey(input, "SHA1withRSA", privateKey);
          Signable_SignWithValidAlgorithmAndKey(input, "SHA256withRSA", privateKey);
          Signable_SignWithValidAlgorithmAndKey(input, "SHA384withRSA", privateKey);
          Signable_SignWithValidAlgorithmAndKey(input, "SHA512withRSA", privateKey);

          // verify using RSA public key
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA1withRSA", publicKey,
              "8e50f4f383e06a91b1c8a84b7a95d21e000c6e17a5ac9955dfc8bd0d89623eae419ab8926099d10e604132a7d7edfbe34f1d5479efb7b30167c9802bcddc27a33e48efd4d1ffc53b4cbb5ddc534f713ce1036455106c830e7aec7ddcbf1e75fb40ce6b2113aec18e9e2fd90fb80538f8ffb6605fb15e0a552fbfdb57e80aa7de85a9c1a002db30e7f68f57128fc0245511cc6ecf88d165a5748ab8739e040440fa9dfc0025917531c9cf318bc104241cd22d9ace7c94c96ee056468614452c4287b94f6e3d1edbeadda50bc8cbff3455ee8ca4ba681ef4e0d9500562e921c16cf8c41a9106340858955423e0c7cb9cb68aadb4cd7e9e49f999d82039f728b376c33b40233fdcdfeb7ef9d3509f41e610014796fdc8c29bf4ff844a90cfdc4ba647b847b5f1db9ee6f6b8c6d881195234d835d71bc4dabef792f51d5c78009577876592b31746c1f10de823f97fa7d0968007f27f153685bdb7f001b9c2ec3e69c46fb23aa8817903558498157a7051494f3e06d67d51bc4e793dc7a36bac0de119bf8c80a6a77796a297910302daee4e683ed78c8ceed18d888d5de5ba38229550d8b21095574563841e1e6cf313822b7ac09cebb4f06f9f3160048ce25e3b62de02731dfd6bac8dfa5ec0612c0daa2b5e2fa878ba6ca091c191513d8797093fe26313d5b8f55c5ce0ea11b3bba7ea304ac89ad3f4d418702f48f7a5d9005cb0");
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA256withRSA", publicKey,
              "3e3620ee1877cb6aa3d4bf4c5fbd1c7d7f81348b3efb48404e36896256ce6529a0d3f1e74f9587d405835d6b34a95b2b7ec8873e62615e5425bd17dd893cb1f3e468a1ed8f123990e62db85849c389560850c55ff1677e8f5159ce7975825c35c09c51dec481c3bbdf363af276febd264039a295532605bf8fb39369f5278ee59e16c0408116389da96ab5149305d21d6f94df678409821a502439e96cce7017bbd12e9d5d87cf3f4dc0c7e5344e474c3a1dac25a38f26294b2c83d1c76ab47ed372be61e449114e815ffa9ea14b9b3039bf194b8f9f919bf6d778748dca2daea69dd54704dc36fcd6fbb33faecdbcdeb9e1d7bf5b7c19fa45c93dacfd4207d74817fb280d3346c3fe843fac8db54ebf345a0f4d6224686c088deaa112e9cf687b3bde0fca35522167ecf6ebe53f2a6e24d00530f55ace169a7dafb956fa9ef63d83ddb9b4665dbfe5d80457b8750503ba07a0464c854249aac7b1799a8eb1074be0b05016312ea396c893efc25559dc693299bd72e2a1f7e362b69c681fc49fe78b0b3782153672b4e1fc0712ac3b4b23072c4e49b2fb2438ad742483c5474fc5e8dfa5b63e11eb87d34fb7582e702433fce2719c39e6ae42ed3d32a1919543f823c4265bd79b3b62d66aa971aff3082df7a910dba66cb3600eb5704db9321d22f94ff1623c364ab387c231e64e818d7643f1ff2ea5abafa0937789ae657784");              
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA384withRSA", publicKey,
              "02453d7bc61f10df9643d9ebf767578755ebec58cb6b0e97b59061bbe62a860efb2a89c6e040204eae938da130d579775344b4dc508c29ba8e7a673c279cec6632c857f702f01d8d2688f30066536018b85fc6f88cfb1a15c6e87939e131de1d5f0a0a91e655b6c81754c8a6b8c5d0afbe1ea8308c6f74dce0043bff0213f5d44b1c483765015f605ad1e2ce5bb3db7677b2824baa61fdbc99820412c5d09997929aa4bb749b7d2e9b211ac35872b97c49271f04e55d43b013e6eba3568a219c9dfb34f93b16519f6ec2c7758fe48674438f8f8aa6dfc20e483f73d2fd2b9fbd7af552f87f0513bed7aa54e06830f6d0b9e246dcb0d7e04aa037a8a3b5abc62ebe0136037a6e1c7b539ea5086cc5b6a1359b0724e87ee9a43f550a1d42408caad3e57ccf1cf4679163627ce0fb72e5a164ad57783b0a7dd87fbf0019f7c6a1a81ae2e1725493b4dcf27556a7d012bf0a10f64ec68da53387c6436652e3d4c2a12626f80f09942fa046c0c9f517c7e5096df97f063b04bc3a63daa9b78ce15400fbcbebd8841e813a886f39d25d4619c8501699b7746314db3680a18af27985c04ba23ea5fc5ad0857472a71d370f55643e9bb64b845253e9d9197eb1078ac5d606cb69c081b3701830a1e0f7d5458794e9841571fafe7f52b28ba561c5ad4bcd69214f3515fc538dc97a72d1fe98d06165250ea67225a0516af66a352ce7c8af");
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA512withRSA", publicKey,
              "974a38cb8da01f0b4bc521db69d2239cc931d9237296e6e3ed71ff606b2ed1accb2539849aaaa1fd723e5dc2bb3eb8a6f8597eb052287b3ef2ccbd7ea94967f719a06805ffd579bc54cba6a6fc8036611d1b928b741e39a69c4f5aa16d7b5ab30191ff9e24b66863330699b2e9de84ac414335624fd1a242655923cd23ce3dbf9c7194acb52b8f20d3df684ed2a2dd9bda1f46b077d226148099e361286f6143fd9fddbb529da1239051c768ce9e4f38669ea0b1ef6b94bacee8ea5869edabdb88a1aebf0f9a0eab82b7d12062522c46ea2bf530f9248fcbd3916c602d53eca952c676d9f49d1414128c1ec2147ff40207ba3e58b4af71f66fa6bf1c7c54a95ad454ce71c3fde657292271e1fadd97392d9d66ecc24d7ecbf7864f8fd37e0ce1852d2a54deaec7e0d08db8b82d446b430f57e50481f307cabc289b36ae9059e961a41f13b9766bdd885b2a49ef33d23d537bad83b1d9c944206fa7e239dc3aa15081d478527ba1a2c21c72ddc0c8b4e11a3c61ec8155f9ba2eef53e2725fc81741a0258e2b1f41c71ccc4a6f172a2b141f794716928910f1b8a0aad570ad4d9404d177a8b8c3a1d006f2872c7db0aae0faeb487827badc233275777eea0ecff9de3017692086265d615d0f14cc23f31fce5846e9f3e63370dbf1d9d5285c20a027c7651dc210a0d28f871b6b0f8cd9b05db864c9cc076304920fbcb41cfcb3d5");

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
          Signable_SignWithValidAlgorithmAndKey(input, "SHA1withECDSA", privateKey);
          Signable_SignWithValidAlgorithmAndKey(input, "SHA256withECDSA", privateKey);
          Signable_SignWithValidAlgorithmAndKey(input, "SHA384withECDSA", privateKey);
          Signable_SignWithValidAlgorithmAndKey(input, "SHA512withECDSA", privateKey);

          // verify using ECDSA public key
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA1withECDSA", publicKey,
              "3081870241212ea902cf9be3f5730a8158117b4f89472118b403cc01f8fc1b7fe862b4a79e7a047b65397ac5674337ea0c2bec3f7a2aa69ddb07184d4b8685bd4ddb5b040715024200ccc6e8013e2b81bb14b68baa82d66e554b5d247ee689937284b2b227b18c6d052d5516c446e10e100c54e752f8201d88fdf4526d0b81ade4bb430e95726526a01a");
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA256withECDSA", publicKey,
              "308188024201d8f5a7c88984c434d8734c39ef0dc42ebe61fda81e85bf85632ff5222604329708d49979a34939121d348151192823357c33d8560546437b1abb18b798e408c2890242012413dcd6d4df9a10bbf6d925ab4a9e3fbabd053535af7c1c8899e880fce36267bbbd0e739d6cc029afbe58ba6719d61bba7bbf8ed78d9116656e606e5b7591de18");
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA384withECDSA", publicKey,
              "308187024201143d1d19954bd02ea734d14ba263293c1c9c36f1e848894e6da74e65f9f932ee8926df2271d7db866c605412e9c684e72ab12eacf15bfdb2e3b41aa93efeb7d9aa0241290eddc9fece4df415d196eef25278c515a5d4586928f2c14dfdfeb44e7feb4257cc296233522bed208b28e53dd7e73259b47b74dce4925b6aff97257236ffde70");
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA512withECDSA", publicKey,
              "30818602415ff9c28230418dbde9c35c5a67aec3edca82037e25e706161223035433a32eeb2e9d713e7455e78c19d5623b6d4155be8408d01863619f3caaf5b87afc8237f3d802411a3622db5e803c5d5d6c7b003a4baeda370d7e0fac3524b1d4fb536a8441a3184641cb974507017520e91c3b0700db5332f9daa49939eab614f99f076b71ef106e");

          // sign with algorithm and private key mismatch
          Signable_SignWithMismatchedAlgorithmAndKey_InvalidKeyException(input, "SHA256withRSA", privateKey);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'Signable_SignWithValidAlgorithmAndKey',
      args: [
        { name: 'input', type: 'FObject' },
        { name: 'algorithm', type: 'String' },
        { name: 'key', type: 'Any' }
      ],
      javaCode: `
        try {
          test(! SafetyUtil.isEmpty(Hex.toHexString(input.sign(algorithm, (PrivateKey) key))),
              "Input signed using " + algorithm + " produces correct signature");
        } catch ( Throwable t ) {
          test(false, "Input signed using " + algorithm + " should not throw an exception");
        }
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
