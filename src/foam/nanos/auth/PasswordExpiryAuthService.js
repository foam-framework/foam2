/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PasswordExpiryAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'Checks password expiry',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.NanoService',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR'
  ],

  methods: [
    {
      name: 'start',
      javaCode:
        `if ( getDelegate() instanceof NanoService ) {
          ((NanoService) getDelegate()).start();
        }`
    },
    {
      name: 'login',
      javaCode:
        `User user = (User) ((DAO) getLocalUserDAO())
          .inX(x)
          .find(
            AND(
              OR(
                EQ(foam.nanos.auth.User.EMAIL, id.toLowerCase()),
                EQ(foam.nanos.auth.User.USER_NAME, id)
              ),
              EQ(foam.nanos.auth.User.LOGIN_ENABLED, true)
            )
          );

        if ( isPasswordExpired(user) ) {
          throw new AuthenticationException("Password expired");
        }
        return getDelegate().login(x, id, password);`
    },
    {
      name: 'isPasswordExpired',
      documentation: 'Checks if password is expired. True if expired, false if not expired',
      type: 'Boolean',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      args: [
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode:
        `if ( user == null ) {
          throw new AuthenticationException("User not found");
        }
        // if we are after the expiry date then prevent login
        return user.getPasswordExpiry() != null && user.getPasswordExpiry().getTime() < System.currentTimeMillis();`
    }
  ]
});
