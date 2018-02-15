/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'EmailVerificationDAO',
  extends: 'foam.dao.ProxyDAO',

  imports: [
    'emailToken'
  ],

  javaImports: [
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'put_',
      javaCode:
`EmailTokenService emailToken = (EmailTokenService) getEmailToken();
boolean newUser = getDelegate().find(((User) obj).getId()) == null;

User result = (User) super.put_(x, obj);
// send email verification if new user
if ( result != null && newUser && ! result.getEmailVerified() ) {
  emailToken.generateToken(result);
}
return result;`
    }
  ]
});
