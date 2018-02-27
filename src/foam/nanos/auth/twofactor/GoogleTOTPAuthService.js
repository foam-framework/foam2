foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'GoogleTOTPAuthService',
  extends: 'foam.nanos.auth.twofactor.AbstractTOTPAuthService',

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
      name: 'STEP_SIZE',
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
`long code = Long.parseLong(token, 10);
User user = (User) x.get("user");
DAO userDAO = (DAO) getLocalUserDAO();

// fetch from user dao to get secret key
user = (User) userDAO.find(user.getId());
return checkCode(user.getTwoFactorSecret(), code, STEP_SIZE, WINDOW);`
    }
  ]
})