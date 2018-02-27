foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'AbstractTOTPAuthService',
  extends: 'foam.nanos.auth.twofactor.AbstractOTPAuthService',
  abstract: true,

  documentation: 'Abstract time-based one-time password auth service',

  javaImports: [
    'org.apache.commons.codec.binary.Base32',
    'javax.crypto.Mac',
    'javax.crypto.spec.SecretKeySpec',
    'java.util.Date'
  ],

  methods: [
    {
      name: 'checkCode',
      javaReturns: 'boolean',
      args: [
        {
          name: 'secret',
          javaType: 'String'
        },
        {
          name: 'code',
          javaType: 'long'
        },
        {
          name: 'stepsize',
          javaType: 'long'
        },
        {
          name: 'window',
          javaType: 'int'
        }
      ],
      javaCode:
`try {
  byte[] key = new Base32().decode(secret);
  long t = new Date().getTime() / stepsize;

  for (int i = -window; i <= window; ++i) {
    long hash = calculateCode(key, t + i);
    if (hash == code) {
      return true;
    }
  }

  return false;
} catch (Throwable t) {
  return false;
}`
    },
    {
      name: 'calculateCode',
      javaReturns: 'long',
      javaThrows: [
        'java.security.InvalidKeyException',
        'java.security.NoSuchAlgorithmException'
      ],
      args: [
        {
          name: 'key',
          javaType: 'byte[]'
        },
        {
          name: 'time',
          javaType: 'long'
        }
      ],
      javaCode:
`byte[] data = new byte[8];
long value = time;
for ( int i = 8 ; i-- > 0; value >>>= 8 ) {
  data[i] = (byte) value;
}

SecretKeySpec signKey = new SecretKeySpec(key, "HmacSHA1");
Mac mac = Mac.getInstance("HmacSHA1");
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

return (int) truncatedHash;`
    }
  ]
});