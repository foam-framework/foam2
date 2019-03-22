foam.INTERFACE({
  package: 'foam.nanos.hello',
  name: 'HelloService',
  methods: [
    {
      name: 'hello',
      async: true,
      type: 'String',
      args: [ { name: 'name', type: 'String' } ],
    }
  ]
});