/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'GoogleTOTPAuthService',
  extends: 'foam.nanos.auth.twofactor.AbstractTOTPAuthService',

  documentation: 'Google Authenticator Time-based One-time Password Service (TOTP)',

  javaImports: [
    'com.google.common.io.BaseEncoding',
    'foam.dao.DAO',
    'foam.nanos.app.EmailConfig',
    'foam.nanos.auth.User',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'io.nayuki.qrcodegen.QrCode',
    'java.net.URI'
  ],

  constants: [
    {
      name: 'KEY_SIZE',
      value: 10,
      type: 'Integer'
    },
    {
      name: 'STEP_SIZE',
      value: 30 * 1000,
      type: 'Long'
    },
    {
      name: 'WINDOW',
      value: 3,
      type: 'Integer'
    }
  ],

  properties: [
    [ 'algorithm', 'SHA1' ]
  ],

  methods: [
    {
      name: 'generateKeyAndQR',
      javaCode: `
        User user = (User) (x.get("agent") != null ?
          x.get("agent") :
          x.get("user")) ;
        DAO userDAO = (DAO) x.get("localUserDAO");

        // fetch from localUserDAO to get updated user before setting TwoFactorSecret
        user = (User) userDAO.find(user.getId());

        // generate secret key, encode as base32 and store
        String key = BaseEncoding.base32().encode(generateSecret(KEY_SIZE));
        key = key.replaceFirst("[=]*$", "");

        // update user with secret key
        user = (User) user.fclone();
        user.setTwoFactorSecret(key);
        userDAO.put_(x, user);

        try {
          EmailConfig service = (EmailConfig) x.get("emailConfig");
          String name = service == null ? "FOAM" : service.getDisplayName();
          String path = String.format("/%s:%s", name, user.getEmail());
          String query = String.format("secret=%s&issuer=%s&algorithm=%s", key, name, getAlgorithm());
          URI uri = new URI("otpauth", "totp", path, query, null);

          return new OTPKey.Builder(x)
            .setKey(key)
            .setQrCode("data:image/svg+xml;charset=UTF-8,"+
              QrCode.encodeText(uri.toASCIIString(), QrCode.Ecc.MEDIUM).toSvgString(0))
            .build();
        } catch ( Throwable t ) {
          throw new RuntimeException("Error when generating QR code.", t);
        }
      `
    },
    {
      name: 'verifyToken',
      javaCode: `
        long code;
        try {
          code = Long.parseLong(token, 10);
        } catch(Exception e){
          return false;
        }

        User user      = (User) (x.get("agent") != null ?
          x.get("agent") :
          x.get("user")) ;
        DAO userDAO    = (DAO) x.get("localUserDAO");
        DAO sessionDAO = (DAO) x.get("localSessionDAO");

        String sessionUser = (String) ( x.get("agent") != null ? "agent" : "user" );

        // fetch from user dao to get secret key
        user = (User) userDAO.find(user.getId());

        if ( checkCode(BaseEncoding.base32().decode(user.getTwoFactorSecret()), code, STEP_SIZE, WINDOW) ) {
          if ( ! user.getTwoFactorEnabled() ) {
            user = (User) user.fclone();
            user.setTwoFactorEnabled(true);
            userDAO.put(user);
          }

          // update session with two factor success set to true
          Session session = x.get(Session.class);
          session.setContext(session.getContext().put(sessionUser, user).put("twoFactorSuccess", true));
          sessionDAO.put(session);
          return true;
        }

        return false;
      `
    },
    {
      name: 'disable',
      javaCode: `
        if ( verifyToken(x, token) ) {
          User user   = (User) (x.get("agent") != null ?
            x.get("agent") :
            x.get("user")) ;
          DAO userDAO = (DAO) x.get("localUserDAO");

          // fetch user from DAO and set two factor secret to null
          user = (User) userDAO.find(user.getId()).fclone();
          user.setTwoFactorEnabled(false);
          user.setTwoFactorSecret(null);
          userDAO.put_(x, user);

          return true;
        }

        return false;
      `
    }
  ]
});
