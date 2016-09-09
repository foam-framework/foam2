
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

var cls = foam.java.Class.create();
com.example.Person.buildJavaClass(cls);


var output = foam.java.Outputter.create();
output.out(cls);

foam.u2.Element.create().setNodeName('pre').add(output.buf_).write()
