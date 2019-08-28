foam.INTERFACE({
  package: 'foam.nanos.test',
  name: 'EchoService',
  methods: [
    {
      name: 'echo',
      type: 'FObject',
      async: true,
      args: [ { name: 'obj', type: 'FObject' } ]
    }
  ]
});
