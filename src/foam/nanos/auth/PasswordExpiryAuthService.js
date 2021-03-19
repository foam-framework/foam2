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
    'DAO localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.NanoService',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserNotFoundException',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.OR',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.CLASS_OF'
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
          .find(
            AND(
              OR(
                EQ(User.EMAIL, identifier.toLowerCase()),
                EQ(User.USER_NAME, identifier)
              ),
              CLASS_OF(User.class)
            )
          );

        if ( isPasswordExpired(user) ) {
          throw new AuthenticationException("Password expired");
        }
        return getDelegate().login(x, identifier, password);`
    },
    {
      name: 'isPasswordExpired',
      documentation: 'Checks if password is expired. True if expired, false if not expired',
      type: 'Boolean',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      args: [
        {
          name: 'user',
          type: 'User'
        }
      ],
      javaCode:
        `if ( user == null ) {
          throw new UserNotFoundException();
        }
        // if we are after the expiry date then prevent login
        return user.getPasswordExpiry() != null && user.getPasswordExpiry().getTime() < System.currentTimeMillis();`
    }
  ]
});
