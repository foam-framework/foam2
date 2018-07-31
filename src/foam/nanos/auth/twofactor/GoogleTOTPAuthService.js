/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'GoogleTOTPAuthService',
  extends: 'foam.nanos.auth.twofactor.AbstractTOTPAuthService',

  javaImports: [
    'com.google.common.io.BaseEncoding',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'io.nayuki.qrcodegen.QrCode',
    'java.net.URI'
  ],

  constants: [
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

  properties: [
    ['algorithm', 'SHA1' ]
  ],

  methods: [
    {
      name: 'generateKey',
      javaCode:
`User user = (User) x.get("user");
DAO userDAO = (DAO) x.get("localUserDAO");

// fetch from user dao to get secret key
user = (User) userDAO.find(user.getId());

String key;
if ( SafetyUtil.isEmpty(user.getTwoFactorSecret()) ) {
  // generate secret key, encode as base32 and store
  key = BaseEncoding.base32().encode(generateSecret(KEY_SIZE));
  key = key.replaceFirst("[=]*$", "");

  // update user with secret key
  user = (User) user.fclone();
  user.setTwoFactorSecret(key);
  userDAO.put_(x, user);
} else {
  // use stored secret key
  key = user.getTwoFactorSecret();
}

if ( ! generateQrCode ) {
  return key;
}

try {
  AppConfig config = (AppConfig) x.get("appConfig");
  String path = String.format("/%s:%s", config.getName(), user.getEmail());
  String query = String.format("secret=%s&issuer=%s&algorithm=%s", key, config.getName(), getAlgorithm());
  URI uri = new URI("otpauth", "totp", path, query, null);
  return "data:image/svg+xml;charset=UTF-8," + QrCode.encodeText(uri.toASCIIString(), QrCode.Ecc.MEDIUM).toSvgString(0);
} catch ( Throwable t ) {
  throw new RuntimeException(t);
}`
    },
    {
      name: 'verifyToken',
      javaCode:
`long code = Long.parseLong(token, 10);
User user = (User) x.get("user");
DAO userDAO = (DAO) x.get("localUserDAO");

// fetch from user dao to get secret key
user = (User) userDAO.find(user.getId());

if ( checkCode(BaseEncoding.base32().decode(user.getTwoFactorSecret()), code, STEP_SIZE, WINDOW) ) {
  if ( user.getTwoFactorEnabled() ) {
    user = (User) user.fclone();
    user.setTwoFactorEnabled(true);
    userDAO.put(user);
  }
  return true;
}

return false;`
    }
  ]
});
