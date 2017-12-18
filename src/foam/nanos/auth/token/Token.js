foam.CLASS({
  package: 'foam.nanos.auth.token',
  name: 'Token',

  documentation: 'Represents a token',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      name: 'userId',
      of: 'foam.nanos.auth.User',
    },
    {
      class: 'Boolean',
      name: 'processed',
      value: false
    },
    {
      class: 'Date',
      name: 'expiry',
      documentation: 'The token expiry date'
    },
    {
      class: 'String',
      name: 'data',
      documentation: 'The token data'
    }
  ]
});
