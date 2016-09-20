
foam.CLASS({
  name: 'Test',
  properties: [
    {
      class: 'Int',
      name: 'foo',
      preSet: function(_, a) {
        if ( a > 20 ) return 20;
        return a;
      }
    }
  ]
});

var d = Test.create();
foam.u2.DetailView.create({ data: d }).write();
foam.u2.DetailView.create({ data: d }).write();
//foam.u2.DetailView.create({ data: d }).write();
d.foo$.sub(console.log.bind(console));
