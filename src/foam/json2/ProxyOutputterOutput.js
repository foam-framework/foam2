foam.CLASS({
  package: 'foam.json2',
  name: 'ProxyOutputterOutput',
  implements: [
    'foam.json2.OutputterOutput'
  ],
  properties: [
    {
      class: 'Proxy',
      of: 'foam.json2.OutputterOutput',
      name: 'delegate',
    },
  ],
})
