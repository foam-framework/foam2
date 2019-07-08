foam.CLASS({
    package: 'foam.nanos.crunch',
    name: 'FakeDataObject',
  
    documentation: `
    fake dataobject to test capability
    `,
  
    implements: [
      'foam.core.Validatable'
    ],
  
    javaImports: [
      'foam.nanos.auth.AuthorizationException',
      'foam.nanos.auth.AuthService',
      'foam.util.SafetyUtil',
    ],
  
    properties: [
      {
        name: 'username',
        class: 'String',
      },
      {
        name: 'password',
        class: 'String'
      }
    ],
  
    methods: [
      {
        name: 'validate',
        args: [
          {
            name: 'x', type: 'Context'
          }
        ],
        type: 'Void',
        javaThrows: ['IllegalStateException'],
        javaCode: `
        if ( SafetyUtil.isEmpty(this.getUsername()) ) {
          throw new IllegalStateException("username is required.");
        }
        if ( SafetyUtil.isEmpty(this.getPassword()) ) {
          throw new IllegalStateException("password is required.");
        }
        if(!this.getUsername().equals("RUBY")) throw new RuntimeException("incorrect username");
        if(!this.getPassword().equals("PASS")) throw new RuntimeException("incorrect password");
            
        `
      }
    ]
  });
    