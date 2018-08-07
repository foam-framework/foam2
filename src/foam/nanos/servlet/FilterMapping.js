foam.CLASS({
  package: 'foam.nanos.servlet',
  name: 'FilterMapping',
  properties: [
    {
      class: 'String',
      name: 'filterClass',
    },
    {
      class: 'Map',
      name: 'initParameters'
    },
    {
      class: 'String',
      name: 'pathSpec'
    }
  ]
});
