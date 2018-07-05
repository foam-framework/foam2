foam.CLASS({
  package: 'foam.nanos.servlet',
  name: 'ServletMapping',
  properties: [
    {
      class: 'String',
      name: 'className'
    },
    {
      class: 'String',
      name: 'pathSpec'
    },
    {
      class: 'Map',
      name: 'initParameters'
    }
  ]
});
