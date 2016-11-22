/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  name: 'Abc',
  properties: [
    {
      name: 'id'
    },
    {
      name: 'foo',
      value: 0
    }
  ]
});

var dao = foam.dao.ArrayDAO.create({ array: [] });

dao.put(Abc.create({ id: 1 })).then(function(a) {
  console.log("Put wrapper"); return a;
}, null).then(function(o) {
  console.log("Put", o.id);
  dao.put(Abc.create({ id: o.id, foo: 12 }));
});
dao.put(Abc.create({ id: 2 }));
dao.put(Abc.create({ id: 3 }));
dao.put(Abc.create({ id: 4 }));
dao.put(Abc.create({ id: 5 }));


dao.put(Abc.create({ id: 2, foo: 100 })).then(
  function(obj) {

  });

dao.select(foam.mlang.sink.Count.create()).then(function(c) {
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
  name: 'LoggingSink',
  imports: ['log'],
  implements: ['foam.dao.Sink'],
  methods: [
    function put(obj) {
      console.log("Got object", obj.id);
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'Test',
  implements: [
    'foam.dao.Sink',
    'foam.mlang.Expressions'
  ],
  imports: ['log'],
  methods: [
    function put(o) {
      this.log("Got object ", o.id, "foo is", o.foo);
    },
    function test(o) {
      dao.where(
        foam.Function.with(
          this,
          function(OR, EQ) {
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
  properties: [
    'dao'
  ],
  methods: [
    function go() {
      this.dao.limit(3).skip(1).select(LoggingSink.create());
    }
  ]
});
DaoTest.create({ dao: dao }).go();

dao.on.sub(function(_, __, type, o) {
  console.log("On event", type, o && o.id);
});
dao.on.remove.sub(function(_,__,___,o) {
  console.log("On remove", o.id);
});


dao.removeAll();
dao.put(Abc.create({ id: 4 }));
dao.remove(12).then(console.log.bind(console, "Removed 12"), console.error.bind(console, "Error removing 12"));


console.log("Testing promise dao.");
var resolver;
var dao2 = foam.dao.PromiseDAO.create({ promise: new Promise(function(res, rej) { resolver = res; }), of: Abc });
dao2.put(Abc.create({ id: 1 }));
dao2.put(Abc.create({ id: 2 }));
dao2.select(LoggingSink.create());
dao2.remove(Abc.create({ id: 2 }));

dao2.select(LoggingSink.create()).then(function(a) {
  console.log("Second select finished.");
  return dao2.put(Abc.create({ id: 4 }));
}).then(function(p) {
  console.log("Put object", p.id);
});

setTimeout(function() {
  resolver(foam.dao.ArrayDAO.create());
}, 1000);

setTimeout(function() {
  dao2.select(LoggingSink.create())
    .then(function() {
      return dao2.put(Abc.create({ id: 5 }));
    }).then(function() {
      dao2.select(LoggingSink.create());
    });
}, 2000);
