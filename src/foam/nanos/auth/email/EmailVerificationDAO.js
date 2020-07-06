/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'EmailVerificationDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.email.EmailTokenService',
      name: 'emailToken'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            public EmailVerificationDAO(X x, DAO delegate) {
              setX(x);
              setDelegate(delegate);
              setEmailToken((EmailTokenService) x.get("emailToken"));
            }
          `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        boolean newUser = getDelegate().find(((User) obj).getId()) == null;

        // send email verification if new user
        User result = (User) super.put_(x, obj);
        if ( result != null && newUser && ! result.getEmailVerified() ) {
          getEmailToken().generateToken(x, result);
        }
    
        return result;
      `
    }
  ]
});
