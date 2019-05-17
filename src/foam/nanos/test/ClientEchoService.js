foam.CLASS({
  package: 'foam.nanos.test',
  name: 'ClientEchoService',
  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.test.EchoService',
      name: 'delegate'
    }
  ]
});
