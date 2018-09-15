foam.CLASS({
  package: 'foam.build.output',
  name: 'ProxySerializer',
  implements: [
    'foam.build.output.CodeSerializer',
  ],
  properties: [
    {
      class: 'Proxy',
      of: 'foam.build.output.CodeSerializer',
      name: 'delegate',
    }
  ],
});
