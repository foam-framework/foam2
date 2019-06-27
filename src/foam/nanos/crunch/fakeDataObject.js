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
    'foam.core.PropertyInfo',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.util.Iterator',
    'java.util.List',
    'java.util.regex.Pattern',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.AddressException',
    'net.nanopay.account.Account',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.model.Business',
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
  