foam.CLASS({
  package: 'foam.nanos.hello',
  name: 'ClientHelloService',
  implements: [ 'foam.nanos.hello.HelloService' ],


  requires: [
    'foam.box.HTTPBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      name: 'delegate',
      of: 'foam.nanos.hello.HelloService'
    }
  ]
});
  