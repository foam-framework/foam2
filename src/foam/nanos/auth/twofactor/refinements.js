foam.CLASS({
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'Boolean',
      name: 'twoFactorEnabled',
      documentation: 'Two factor enabled flag'
    },
    {
      class: 'String',
      name: 'twoFactorSecret',
      documentation: 'Two factor secret',
      networkTransient: true
    }
  ]
});