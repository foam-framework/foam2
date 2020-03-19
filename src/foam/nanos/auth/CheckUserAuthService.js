foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CheckUserAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',
  documentation: `
  AuthService to prevent calling checkUser if the context user does not have
  permission to check permissions for other users.
  `,

  constants: [
    {
      name: 'CHECK_USER_PERMISSION',
      type: 'String',
      value: 'service.auth.checkUser'
    }
  ],

  methods: [
    {
      name: 'checkUser',
      javaCode: `
        if ( ! check(x, CHECK_USER_PERMISSION) ) throw new AuthorizationException();
        return getDelegate().checkUser(x, user, permission);
      `
    }
  ]
});