foam.CLASS({
  package: 'foam.nanos.auth.test',
  name: 'DummySp',

  documentation: 'A fake/mock/dummy model just to test ServiceProvideAware',

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'owner',
      class: 'Reference',
      of: 'foam.nanos.auth.User'
    }
  ]
});
