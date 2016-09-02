
foam.CLASS({
  package: 'com.example',
  name: 'Person',
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

var cls = foam.java.Class.create();
com.example.Person.buildJavaClass(cls);

foam.u2.Element.create().setNodeName('pre').add(cls.code()).write();
