
foam.CLASS({
  name: 'Test',
  properties: [
    'foo',
    {
      class: 'Boolean',
      name: 't',
      value: true
    },
    {
      class: 'Boolean',
      name: 'f',
      value: false
    }
  ]
});

var d = Test.create();
foam.u2.DetailView.create({ data: d }).write();
foam.u2.DetailView.create({ data: d }).write();
d.propertyChange.sub(function(_, _, prop, s) {
  console.log('prop: ', prop, s.get());
});
