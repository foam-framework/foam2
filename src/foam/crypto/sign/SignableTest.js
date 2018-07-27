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
      type: 'String',
      name: 'RSA_PRIVATE_KEY',
      documentation: 'RSA 4096 private key',
      value: 'MIIJQwIBADANBgkqhkiG9w0BAQEFAASCCS0wggkpAgEAAoICAQCYhm9xs09iwIyBo1ED68M+1pCZpPCUrWtXm6OhfxEIOGmvKP1H61PnCAdP9pmDdWW992Ge5dTl98en/eZwMvLAvr/JD4K03aeXBXj89l949SkkaFL/7Ca81ymJHPYu3XWMf596AlrQij1AaydyuqZgKYiQ6SsRFw03VXqmaYqF+y6GcnMhRBHJiHz5XtVjm70xwu+JbtIq/D3HYh1jIn86/uS28dPMEJGK8gFF34wpDXkJn0++YAwe/TzqQQRZMsIWTwgKZWGdLOW8wNkJr4Yp5n+AVg/LGWfk4P/GPGwq2k+6RlMcyRiyic9z0fYGz9gkH/OowEg8LLPjmr1/P0m+Q8odJohcUOFAIZFaQm0b65lfwR+n2zA8p3SNdZYUQOt5IZeO1MFQ2tCNPnJZfFCx7o/sheZd4PyuGPbp5HlZv8Yq3rkNJZLuUcwdDAS51OL2V1CmTQlrBIfAxKgXdLakkljNsAA+5gmoawizR52ckzf4bnaAjkdUpNe8qYKlP6g8D+izxeufO8loBgmL9WS0Rm5F74XeFRGXSmlwCuMMeAB4th/t+XyQj+oSUEfIqhafnqH//EmxB0ayWpdFDdVUDvDOSCbdMsBU1aHO9tRb/pIsIj9ZRtHabzPTg6LSgHZ5cY7DWNR+iTIyJ7W9wP/+YElfU0xOPjuyefDkduY5PwIDAQABAoICAAZZ6sAYUGDzVaZ8T35TTfEK7ECJnr8CLasbPwgVi3cFKllx4oIhKYBAVFWfFitkMxVi/LyqI2BkHfs/1l2rsXIXP1M3AyFW7YibYLtf4v/dbZYnhfVENyS77O3Zt+KhtChilBh3iqKObxiEncLoRM9SS26FVxbCF/nK5G2TjYIgwII2t9aVyAvVVCbqLQaV0J4G2QSnCbdig4wO6Nxc7mFdhdacYU5pDjZz91uagHKhLf4ZlS9/PmH395ZlmLHCLFTTe6k7KYJrATIH8cG2fma2Q27rpoK1jx73w47Uq0hpiNJf5UwYj5+3n1zaTF1iQETY08OeJiPjVKZQpj1rPD3QQMKsC1UmKvVGgAtuVcjoXzft0nbRvY6dwxo2Wf4BWk+GfKLZwzF6UDc/J1BQPYc0njlzcZVP1McQzKpMl09TiF1NlQxOcNEKLqKm6cDzpxa6iCwCYrZJcTRyyqlBrKyt0aGrACpwmhaU2n95o7Fw+E8eBX4grekHofuhd3r8OdT7pv9ZU44xZjX4WeGfJDkJv/WU5bmBXxoFySb9qKIlZowZT+mz1W8w5N6hc3VhT9cPyQnOWxAEwcF5k88LoV3L1hfLOMmIQMiNkKfaFb35kjC5M7TdSc/+iI9wPtHajRuY2bUWH8hZunsbjVxAaq8LlvqoSeciSUdrfLGBJ2rZAoIBAQDvNRgxL6elxkz7U4mseZXSRY1RtFxSDL/wiPzR/eJsN22Jqs5YL5nan14CLDo5PEsWUVEI0MeqBxavWM23vDjtYvRnPDsRL4ZtiGqeHXFXJKuHz9pZ6qb7493Crfo5fadkfWzPO6Jhxe8nRdlaVHHjJX11rUKLCu/tkJhV9NuJeluVrl1FKsiG5aP+ZPKJfj86YqX2XcCmRV++IhDOihcTX7iN0IOZukIlyyu7ZsnTcFt8Lh10sRSSyRXMYXoVHE2I1h4PNCIy8+LcXdRzSSqInwiqh2a5rT0HQNvoOwjfk0gb4apwmv/hF/k1/WK03F4DDlyrFSx8FOZhCBoRyUMdAoIBAQCjO4jGoUtepG3+b+oQ0Yr2U1MijdmKaqdF6KjMeax/lyoBiWDcD5TmtI5SRBu9O0o4Q0qQZ8js7+D/Q/O4RE/tht/7QPtnHWFrSJcse1LdnExY2KSvmudKcl3lQv92g+hmxNGrODwCwtC40zyZaAWSW9RW0UuxPqwNZEqOvF4ka30XE1BgBgUNN+BOkz9dR+f2qFiBbg6yMC21cZsyQGY9cfzdK2Rk59OvEDex22IDqANxVc+jMBMjXlob1Rzq/P7oDKbn8CB+sLJK87v3/yIkCmAHxCLc0NGHyqH6sHqbo0vK0BfkG/6n1jpBIYgwit1oNCOm8Xy70+YymhZMowMLAoIBAQDlH2A6zMCyQw09triqYhOlw0Unu7CqTtgS18QCiEK3ESh0swzO31lpVTlAr4hdhmkNyXnrDcASFpQeBNuXYEzO5PfhYonZXkJO7FnjdaQ4qkE651boxaCIqayiau7A3qDV2mW84gwZxvPaFEerBDPKNQDFFN4mPKWwUc34l38pYfAToV5pgB9vRsscQyklla2OiSsanpaHLPAWOJ8MlqyfvBIUlGNZflUZyk/rQvuS8Y5PlgRU38ErED029S9wxRlnNmC4g2E2mPD1z1JN0wlQr7QnU2aL92n7Zp69BL7tGC/7tN4C2hS6ULI+iqRfRK0wFDOjE7b2azZ4PsBpxPPpAoIBAQChwhCTzikze7zoxJzu18hevEoJVwq6KWDkXWBRaU4xDmr5JNuQl/xV952GFqpqhwPQ55ZPrhml+z07mWo/M6sFVoBFq6q3D52HxGLTGM8Qf6AE94OT5ezIkLdNx2wDVUqL9QVWKJ8HmWlfjy1hVH0ZAdlVw4i/97xmdPmRo0ejzcUjhedDkROWesXU+AR1+xj7DO7QLHFx0V6qjQ9f6AOpZnlP731IpZfXxzl6Dk5+ExR+Tqw6Khz9ErY3GKTUlaxB5q/L7uE0ywOUVR7z7qg1kPaDG7H0oxbQ+1QzaonGDDfCnx7d1YQxbJFEE+ezOxmX9vtRp8OVGrLneF0ayvvrAoIBABgDpFiZZg7CZGtZGgGJuQ+WBdmgX1LXV4A+pJNtVfWWuD2Khyt0SnY7c28CqR+ntrXFG4ZdUPCI9hzyLi7Zeg3ASY5JEQvz63PoYo6w95Vll/erElMAXYX6tqVMzm9XXAOFDVM85S2n3M6d/rHQlnu5/U74AvTAkIPRMjznG2fOhrwyEwwUvaUTRb9p/NRnuHJEnKeu6nQrOvAJ5ccnrH9F0IRs92vF5t2CQy47Y2FPp6Y9fBsKdtHt//vjVTLP6AvSWioFXVPTa2Y5L+PVsNrmkn4CpEG2E2B824qsfxKbb004HjL85nx6WkLHmRgJyiRAPXs8XfNF0ow58VJVKEw='
    },
    {
      type: 'String',
      name: 'RSA_PUBLIC_KEY',
      documentation: 'RSA 4096 public key',
      value: 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAmIZvcbNPYsCMgaNRA+vDPtaQmaTwlK1rV5ujoX8RCDhpryj9R+tT5wgHT/aZg3VlvfdhnuXU5ffHp/3mcDLywL6/yQ+CtN2nlwV4/PZfePUpJGhS/+wmvNcpiRz2Lt11jH+fegJa0Io9QGsncrqmYCmIkOkrERcNN1V6pmmKhfsuhnJzIUQRyYh8+V7VY5u9McLviW7SKvw9x2IdYyJ/Ov7ktvHTzBCRivIBRd+MKQ15CZ9PvmAMHv086kEEWTLCFk8ICmVhnSzlvMDZCa+GKeZ/gFYPyxln5OD/xjxsKtpPukZTHMkYsonPc9H2Bs/YJB/zqMBIPCyz45q9fz9JvkPKHSaIXFDhQCGRWkJtG+uZX8Efp9swPKd0jXWWFEDreSGXjtTBUNrQjT5yWXxQse6P7IXmXeD8rhj26eR5Wb/GKt65DSWS7lHMHQwEudTi9ldQpk0JawSHwMSoF3S2pJJYzbAAPuYJqGsIs0ednJM3+G52gI5HVKTXvKmCpT+oPA/os8XrnzvJaAYJi/VktEZuRe+F3hURl0ppcArjDHgAeLYf7fl8kI/qElBHyKoWn56h//xJsQdGslqXRQ3VVA7wzkgm3TLAVNWhzvbUW/6SLCI/WUbR2m8z04Oi0oB2eXGOw1jUfokyMie1vcD//mBJX1NMTj47snnw5HbmOT8CAwEAAQ=='
    },
    {
      type: 'String',
      name: 'ECDSA_PRIVATE_KEY',
      documentation: 'ECDSA private key',
      value: 'MIH3AgEAMBAGByqGSM49AgEGBSuBBAAjBIHfMIHcAgEBBEIA/5NXupegNi4+T7D7yEb4fE8ipLnasyoWOo2ippURQC9oMPtF4k/JhqdCh2kdorYthmf9ANcAZAUKWJ7S0DETQ3GgBwYFK4EEACOhgYkDgYYABAAQDu9DO0C6ILRIsJFwxeycH3vWxxzuvMYu2VFjWq9WCiU3aUr1VF+WytSepXzvuCU7+E1aYPhp8AIHabQ7ZMzMOAE7Pm54YJzvnO2KASQWJm/W78QfgyH5US4Mze/LGNjsgQ1IwtDKeIef/QE1E/99gsoRJ7jkbeTOTgokUorYmMkzXg=='
    },
    {
      type: 'String',
      name: 'ECDSA_PUBLIC_KEY',
      documentation: 'ECDSA public key',
      value: 'MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAEA7vQztAuiC0SLCRcMXsnB971scc7rzGLtlRY1qvVgolN2lK9VRflsrUnqV877glO/hNWmD4afACB2m0O2TMzDgBOz5ueGCc75ztigEkFiZv1u/EH4Mh+VEuDM3vyxjY7IENSMLQyniHn/0BNRP/fYLKESe45G3kzk4KJFKK2JjJM14='
    }
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
              "4ba16f594f5250c5784aa6810b6ccb1400a4e90a51db0b0c8be6697dc2b21705c5671da26a8ca8c9d9ec051c79b48ba899d38060853ee947603ac88774e430247794fdda66313c8f1004812ef404da13a6a42b97be366aa477ed7bd898cefd69f7dff2875694dbe0a4f75d1fb6ef47647f306292d3572d4e63bcad39db1319af529b2cde752b323afa8c0636766b5a6dd29b295479e855d8b473d48db2d2a37ba0be82375a205a9cc3e08f0e18de9039a4ad9551dfc29190c8dbe9a1bc5ae3cf4d5fd85f45382616b745e92fbe8c4d8a8ae682ebcb7fbbbdc43d1661e54d56704df1fafb220819096d189aba9e0b4c4d1d3cde6482f5fc55d3998fb9d1f45c98ed22b0d8e0ffe09e88b420c29b779a1805d801e240d2d6ad9be68e1071a9253ea862c745b507b9c9fb152df916f38cd0c86e4671a8cec14146eab3dd3cebfdcdefcdce6426f824da16e4d84327f5b2542aa4614a69dc7875776b1a9af34e59515ce1ebed3263ebdbf22fb8bb5fb0e7035be642bf31ff22405c9f9c68d447730f9904e26be7c6c449184114583f4c985c9e743ec86044327d696ef77d266e51976dda7dedbae38887f3312e8b64aa51b8eada6bfe48d13a85b772d6945604ff1c7f5713df73df5826fc13ac7f1d82b81d448cfd2a68e9213ad925add1342c9c4930f4b568d7d5d980fd807ea8a8e3bdc8ffc8085876a8a685063e7b777dbab2b1");
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA256withRSA", publicKey,
              "07bd58711375a5bd424e506114d2db07ae51cb861043f2181f51edeeb0072308a21c997ed6d794f96eb6b4f4ba2c66ae63fe5b4cad4b9983032e24ed101e4e063e847c86c092518e6b4a5a4711115980147ebe6eb44d740a9706d6ce92cd3fe07f89181ca3905ba6bc101a2b113ae6c6e5fb8c899a55033c0a1d7cc4fb0f6342b0a913f3bace4c2a410c1f4fe7ddb90102ba8ca037df67fa5858fd6d80be8f480d2b3cd98e7f3f82548c3b2c14e4c4dafe242b9ef88935255a819abc25a0eb7cdb9969b27a1ee50d6dc2a7ba10b0424e60ddf2357bc4943af2407467b419d095a1c3124f4307ea43d9d1e36b73da67abe7882c9ab4fb11a284c8ad8c7ef59a9c7be879045315fd0bf712eccd712d5d0ee9dae7c5bd667d2874ffe2e5d55f1ac9b572f67204b78a824d8d16d99abcb32c77192319cfdaef70ad3746c2fa46a458f4bfd2e36d188e866c5a6b626871c015a7f78ef6c3f668c3d78f26fd2ef62fa0b879128747873c4ce75e7d28c9234d50b35da8e210592723011dfd854faec031d0461e5b270e1fe5f99df40a0c69fb5937f22bcd773325bd31225ee8a6a16353535500cf020d6eb6506d2f38f5641155b3e53d13c6ec474e11f0e1632bb991d44bae3ea5fe6254bfb73a68c9c08d174064f38bfcfb2f540543d5c81a43aed57ba1327881252564d642070fc27483f131577857bf2c930169a03b770e9eef6eaa");
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA384withRSA", publicKey,
              "153788f78bf689fa50389143b260d5ce1066f83b1ac3fbf88d0f7358e104fd5ac271b32560b7d3c5300d6aeaa4fffebaf3cc719433ccacf455dae174522bce647e0c64d39a8307efdb2086ba2687894a08a1053433a488c3bc61557c3e343d3cf3cf685c476a4bfc1322955f2a8ff4432b1cc194eab67a37d60abc3a31e567655e3d6efec8c3e1b64002010b148ef06c97688dbc590f47fc2847e709bcf87beb83ea9d618457a69104447b464028a61634f1cfb5e389dfe1ece0e6b73a0601bba12c7d833b180217aad0891f865b41ebb9f5f2f951ebcccd7fa690c307c6f732ab4eda2e2f821708a46f9fe87864c0b2d9b09af59dbbd43311e0eb4970c8d2207ff6edf954d18ce17a363a17d9b107a054de445189a826b8a45e51ce9c164bdefcc21bfe8ea7344a6df06d1ea65a9f4dd22b2065867dd35e377a3cf4b682ac11cf769d4046aee550e323ce55fd560642a4ce6c2d7b6e5a2f7d7b82182318818ed361051bccfba2ddd38612081f74471047404a926bd236b648824ab18a2c3aaa771cc589ed6fe102b309460379c66142941443b9c4d27f2d12888b4f5e5ad1200ce66e16dda1ab26f685f65b39a3f60b251a1436ba3515b0d1ac6d255c29ff2ae704bce8a244dbcd30e3c1da7e97e39af1b1954c47478ae24da000767d811a3650f662feb387a37f905fb153505eb5468c95e1fc6204dc0125c0990712ccb474");
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA512withRSA", publicKey,
              "96f95e46a1289eb59b2338ddd1785b47d21ba038fdcfbfcf811368af639dbe85e2f82cb08eaf5cec8b30a52515cddd8bc2016ffbc8ee29d0eb3ece80b111520790b000e8502c639158436b1c7295a9cd607edf7fe9641885369b6dffa485db5d734a21c2792f510c0518722bc8489f82cde2be32349934d18f20de8b385a64c294dd9585b9ba776af34b6547b7846f30c27ad739aa635d2dfa07241501e0a85ca564437f83879ae9d2b40fc4d200da6c0f4462c09d9706ef66a56ae6be104e934c97b6ef26a0463564a5edbf6f5c774099b157298aa4825b33004a63a5d406ac4bc57f8886309b39f9fdd409d3f94afd3a12e888133b05f13afad8f117e35d8c272c480ccdb71b9adb21656b1b43979c818f0f54dc0b9a910c767737fc3f3130d0a0dc6a637cab33f021b2bdfbee26a04f7ed241a7113754ee250e84a1f03690fba6c6660450157d1d82d27679c5aed1f0cb58c267f5b370912449f440fa0c031382e0fbecb92edf1b49de5ff1a932e999f5d2da8ab424a490cf2b6b34298db2c7b4bf6689a5e622113577359fcb9aac67d6ee4add93a0113f003d1f64a5c714f93bc23e923528e561fce9c001a377bc531629223e87aa885e98b69bcba379edda191066441e3f0eddbb31d942902885db8f2ad7bc76c96a2c26049ec125f29c9c8b8bcaf65b951ca0fad707881ce2aa6ef887642a9745f084df52adb219cc46");

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
              "3081880242019b7a7f8b9f22aa971037c1983572b50910b4812fc15004507e5bb28ce102ee3489a32af31cc11ce5f3680d0e356722fc7b53db9e54671fb394a62c866efdfa3b2e02420124af67078580afe85d08bad94b6d5e68532f4fede7534548308da11f38ffbff863b380e8090759d2e775c82c408f1b6917d9d12e9667594c4ddb89d4fddbfee486");
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA256withECDSA", publicKey,
              "308188024201428078adef99bd859ecd06f8163bf04ea8aaa55614d5d62f5f3108278d2600b95f2718314e76a53c80d50723b834638f08405b805b431e0b861741b39e068d726a02420123fea77dab3875aeaee547ae983438eef49f6c2f97c2a83fe7f8d96b7d2996fe279c742d117fbe22da2d170d71965d13cad49d8869660e1426731213e9593482e3");
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA384withECDSA", publicKey,
              "308187024201320f35f44e2bda457e91b6c33aa19b74efa91ff027fd370019a049e181510a2103eca6176ba573497ea795058e0b988ab979a9e8e2721f9ecb0d909d2c72b79b8102411cdcc2a84787a7c059647f9e803ff9456f18e5baa8c71ef67a83af6e79af4fe19dee38a06594c3276c6db86a353b6fad63f853cc47e039e53602e70ca0d262d260");
          Signable_VerifyWithValidAlgorithmSignatureAndKey(input, "SHA512withECDSA", publicKey,
              "308188024201306f9a64590ea794a8d1b87ae8985060487dfb67ad163506fb66e3d86612a6e589e1b64e87478e9bd505d9c4cfaa135f6381691bab580b4cff32d7bfa6e75bae71024200f2b54151c60a0f360591e8d003204409694224809dc51a05a9ca5e4b32a183000362033e38676abb9b7682ead425798a0c471c50e9001ab7c9d8e2de04fba39f58");

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
        { class: 'FObjectProperty', name: 'input'     },
        { class: 'String',          name: 'algorithm' },
        { class: 'Object',          name: 'key'       }
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
        { class: 'FObjectProperty', name: 'input' },
        { class: 'String', name: 'algorithm'      },
        { class: 'Object', name: 'key'            },
        { class: 'String', name: 'signature'      }
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
          test(false, "Sign with mismatched algorithm and key throws InvalidKeyException");
        } catch ( Throwable t ) {
          test(t instanceof InvalidKeyException, "Sign with mismatched algorithm and key throws InvalidKeyException");
        }
      `
    }
  ]
});
