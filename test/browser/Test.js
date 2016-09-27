
foam.CLASS({
  name: 'Test',
  properties: [
    'foo',
    {
      class: 'Boolean',
      name: 't',
      value: true,
      postSet: function(o, n) {
        console.log('** postSet: ', o, n);
//         if ( n === false ) debugger;
      }
    },
    {
//      hidden: true,
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
  console.log('propertyChange: ', prop, s.prevValue, s.get());
});
