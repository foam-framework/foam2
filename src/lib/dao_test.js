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

foam.CLASS({
  package: 'foam.mlang',
  name: 'Test',
  implements: [
    'foam.dao.Sink',
    'foam.mlang.Expressions',
    'With'
  ],
  imports: ['log'],
  methods: [
    function put(o) {
      this.log("Got object ", o.id, "foo is", o.foo);
    },
    function test(o) {
      dao.where(
        this.with(function(OR, EQ) {
          return OR(
            EQ(Abc.FOO, 100),
            EQ(Abc.ID, 4))
        })).select(this);
    }
  ]
});

foam.mlang.Test.create().test();

var c = 0;
dao.select({
  put: function(obj, _, fc) {
    if ( c++ > 1 ) {
      fc.error(new Error("Too Many"));
      return;
    }
    console.log("Got object", obj.id);
  },
  error: function(e) {
    console.error(e);
  },
  eof: function() {
    console.log("EOF");
  }
});

foam.CLASS({
  name: 'DaoTest',
  implements: [
    'With',
    'foam.mlang.Expressions'
  ],
  properties: [
    'dao'
  ],
  methods: [
    function go() {
      this.dao.where(this.with(function(GT) {
        return GT(Abc.ID, 3);
      })).removeAll().then(function() {
        this.dao.select({
          put: function(o, s, fc) {
            console.log(o.id, o.foo);
          },
          eof: function() {
          }
        });
      }.bind(this));
    }
  ]
});

DaoTest.create({ dao: dao }).go();
