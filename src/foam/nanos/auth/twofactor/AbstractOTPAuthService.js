/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'AbstractOTPAuthService',
  abstract: true,

  documentation: 'Abstract OTPAuthService implementation. Only used to add method to generate secret',

  implements: [
    'foam.nanos.auth.twofactor.OTPAuthService'
  ],

  javaImports: [
    'foam.util.SecurityUtil',
    'javax.crypto.Mac',
    'javax.crypto.spec.SecretKeySpec'
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      value: 'SHA256'
    }
  ],

  methods: [
    {
      name: 'generateSecret',
      type: 'Byte[]',
      args: [
        {
          name: 'size',
          type: 'Integer'
        }
      ],
      javaCode: `final byte[] bytes = new byte[size];
SecurityUtil.GetSecureRandom().nextBytes(bytes);
return bytes;`
    },
    {
      name: 'calculateCode',
      type: 'Long',
      javaThrows: [
        'java.security.InvalidKeyException',
        'java.security.NoSuchAlgorithmException'
      ],
      args: [
        {
          name: 'key',
          type: 'Byte[]'
        },
        {
          name: 'interval',
          type: 'Long'
        }
      ],
      javaCode: `
        byte[] data = new byte[8];
        long value = interval;
        for ( int i = 8 ; i-- > 0; value >>>= 8 ) {
          data[i] = (byte) value;
        }

        SecretKeySpec signKey = new SecretKeySpec(key, "Hmac" + getAlgorithm());
        Mac mac = Mac.getInstance("Hmac" + getAlgorithm());
        mac.init(signKey);
        byte[] hash = mac.doFinal(data);

        int offset = hash[20 - 1] & 0xF;

        // We're using a long because Java hasn't got unsigned int.
        long truncatedHash = 0;
        for ( int i = 0 ; i < 4 ; ++i ) {
          truncatedHash <<= 8;
          // We are dealing with signed bytes:
          // we just keep the first byte.
          truncatedHash |= (hash[offset + i] & 0xFF);
        }

        truncatedHash &= 0x7FFFFFFF;
        truncatedHash %= 1000000;

        return (int) truncatedHash;
      `
    }
  ]
});
