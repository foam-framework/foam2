foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'AgentAuthService',

  methods: [
    {
      name: 'ActAs',
      javaReturns: 'foam.nanos.auth.User',
      swiftReturns: 'foam_nanos_auth_User',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context'
        },
        {
          name: 'sudoUser',
          javaType: 'foam.nanos.auth.User'
        }
      ]
    }
  ]
});
