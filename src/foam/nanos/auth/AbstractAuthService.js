foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AbstractAuthService',
  abstract: true,

  implements: [
    'foam.nanos.auth.AuthService'
  ],
  
  methods: [
    {
      name: 'require',
      javaCode: `
        if ( ! check(x, permission) ) {
          if ( exception != null ) throw exception;
          throw new AuthorizationException();
        }
      `
    }
  ]
});
