foam.CLASS({
  name: 'Abc',
  properties: [
    {
      name: 'id'
    },
    {
      name: 'foo',
      defaultValue: 0
    }
  ]
});

var dao = foam.dao.ArrayDAO.create({ array: [] });

dao.put(Abc.create({ id: 1 }));
dao.put(Abc.create({ id: 2 }));
dao.put(Abc.create({ id: 3 }));
dao.put(Abc.create({ id: 4 }));
dao.put(Abc.create({ id: 5 }));


dao.put(Abc.create({ id: 2, foo: 100 })).then(
  function(obj) {

  });

dao.select(foam.mlang.CountExpr.create()).then(function(c) {
  console.log("Count is ", c.value);
});

dao.select({
  put: function(o, s, fc) {
    console.log(o.id, o.foo);
  },
  eof: function() {
  }
});


dao.find(32).then(function(o) {
  console.log("Found", o.id);
}, function(x) {
  console.error(x.message);
});
