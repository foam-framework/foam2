foam.CLASS({
  package: 'foam.nanos.servlet',
  name: 'ServletMapping',
  properties: [
    {
      class: 'String',
      name: 'className'
    },
    {
      class: "FObjectProperty",
      javaType: 'javax.servlet.Servlet',
      name: 'servletObject'
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
