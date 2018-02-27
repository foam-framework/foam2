foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'GoogleTOTPAuthService',
  extends: 'foam.nanos.auth.twofactor.AbstractOTPAuthService',

  imports: [
    'appConfig',
    'localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'io.nayuki.qrcodegen.QrCode',
    'org.apache.commons.codec.binary.Base32',
    'javax.crypto.Mac',
    'javax.crypto.spec.SecretKeySpec',
    'java.util.Date',
    'java.util.concurrent.TimeUnit'
  ],

  constants: [
    {
      name: 'URI',
      value: 'otpauth://totp/%s:%s?secret=%s&issuer=%s',
      type: 'String'
    },
    {
      name: 'KEY_SIZE',
      value: 10,
      type: 'int'
    },
    {
      name: 'TIME_STEP_SIZE',
      value: 30 * 1000,
      type: 'long'
    },
    {
      name: 'WINDOW',
      value: 3,
      type: 'int'
    }
  ],

  methods: [
    {
      name: 'generateKey',
      javaCode:
`User user = (User) x.get("user");
DAO userDAO = (DAO) getLocalUserDAO();

// generate secret key, encode as base32 and store
String key = new Base32().encodeAsString(generateSecret(KEY_SIZE));
key = key.replaceFirst("[=]*$", "");
user.setTwoFactorSecret(key);
user.setTwoFactorEnabled(true);
userDAO.put(user);

if ( ! generateQrCode ) {
  return key;
}

AppConfig config = (AppConfig) x.get("appConfig");
String url = String.format(URI, config.getName(), user.getEmail(), key, config.getName());
return QrCode.encodeText(url, QrCode.Ecc.MEDIUM).toSvgString(2);`
    },
    {
      name: 'verify',
      javaCode:
`try {
  long code = Long.parseLong(token, 10);
  User user = (User) x.get("user");
  DAO userDAO = (DAO) getLocalUserDAO();

  // fetch from user dao to get secret key
  user = (User) userDAO.find(user.getId());
  byte[] key = new Base32().decode(user.getTwoFactorSecret());

  long t = new Date().getTime() / TIME_STEP_SIZE;

  for ( int i = -WINDOW ; i <= WINDOW ; ++i ) {
    long hash = calculateCode(key, t + i);
    if (hash == code ) {
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
})