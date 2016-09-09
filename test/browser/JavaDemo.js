
foam.CLASS({
  package: 'com.example',
  name: 'Person',
  ids: ['name'],
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Boolean',
      name: 'employed'
    }
  ]
});

foam.INTERFACE({
  name: 'Foo',
  methods: [
    {
      name: 'foo',
      javaType: 'void',
      args: [
        {
          name: 'one',
          javaType: 'String'
        }
      ]
    }
  ]
});

foam.u2.Element.create().setNodeName('pre').add(foam.dao.ProxySink.buildJavaClass().toJavaSource()).write()
