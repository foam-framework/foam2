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

  imports: [
    'localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'javax.naming.AuthenticationException',
  ],

  methods: [
    {
      name: 'login',
      javaCode:
`User user = (User) ((DAO) getLocalUserDAO()).find(userId);
if ( isPasswordExpired(user) ) {
  throw new AuthenticationException("Password expired");
}
return getDelegate().login(x, userId, password);`
    },
    {
      name: 'loginByEmail',
      javaCode:
`User user = (User) ((DAO) getLocalUserDAO()).inX(x).find(EQ(User.EMAIL, email.toLowerCase()));
if ( isPasswordExpired(user) ) {
  throw new AuthenticationException("Password expired");
}
return getDelegate().loginByEmail(x, email, password);`
    },
    {
      name: 'isPasswordExpired',
      documentation: 'Checks if password is expired. True if expired, false if not expired',
      javaReturns: 'boolean',
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        }
      ],
      javaCode:
`if ( user == null ) return true;
if ( user.getPasswordExpiry() == null ) return false;

// if we are after the expiry date then prevent login
return user.getPasswordExpiry().getTime() < System.currentTimeMillis();`
    }
  ]
});
