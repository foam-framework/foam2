foam.CLASS({
  package: 'foam.nanos.auth.token',
  name: 'ClientTokenService',

  implements: [
    'foam.nanos.auth.token.TokenService',
  ],
  import: [
    'registry'
  ],
  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.auth.token.TokenService',
      name: 'delegate'
    }
  ]
});
