/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'GoogleTOTPAuthService',
  extends: 'foam.nanos.auth.twofactor.AbstractTOTPAuthService',

  imports: [
    'appConfig',
    'localUserDAO'
  ],

  javaImports: [
    'com.google.common.io.BaseEncoding',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'io.nayuki.qrcodegen.QrCode'
  ],

  constants: [
    {
      name: 'URI',
      value: 'otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=%s',
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

  properties: [
    ['algorithm', 'SHA1' ]
  ],

  methods: [
    {
      name: 'generateKey',
      javaCode:
`User user = (User) x.get("user");
DAO userDAO = (DAO) getLocalUserDAO();

// generate secret key, encode as base32 and store
String key = BaseEncoding.base32().encode(generateSecret(KEY_SIZE));
key = key.replaceFirst("[=]*$", "");
user.setTwoFactorSecret(key);
user.setTwoFactorEnabled(true);
userDAO.put(user);

if ( ! generateQrCode ) {
  return key;
}

AppConfig config = (AppConfig) x.get("appConfig");
String url = String.format(URI, config.getName(), user.getEmail(), key, config.getName(), getAlgorithm());
return QrCode.encodeText(url, QrCode.Ecc.MEDIUM).toSvgString(2);`
    },
    {
      name: 'verifyToken',
      javaCode:
`long code = Long.parseLong(token, 10);
User user = (User) x.get("user");
DAO userDAO = (DAO) getLocalUserDAO();

// fetch from user dao to get secret key
user = (User) userDAO.find(user.getId());
return checkCode(BaseEncoding.base32().decode(user.getTwoFactorSecret()), code, STEP_SIZE, WINDOW);`
    }
  ]
});
