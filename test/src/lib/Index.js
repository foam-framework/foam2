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
  package: 'test',
  name: 'Indexable',

  properties: [
    {
      class: 'Int',
      name: 'int'
    },
    {
      class: 'Float',
      name: 'float'
    },
    {
      class: 'String',
      name: 'string'
    },
    {
      class: 'Date',
      name: 'date'
    },
    {
      name: 'array',
    }
  ]
});

var createData1 = function createData1() {
  return [
    {
      int: 0,
      float: 0.0,
      string: "",
      date: new Date(0),
    },
    {
      int: 1,
      float: 1.1,
      string: "one!",
      date: new Date(1),
    },
    {
      int: 2,
      float: 2.2,
      string: "One!",
      date: new Date(1),
    },
    {
      int: 3,
      float: 3.1,
      string: "Three",
      date: new Date(1),
    },
    {
      int: 4,
      float: 4.4,
      string: "three",
      date: new Date(1),
    },
  ].map(function(cfg) {
    return test.Indexable.create(cfg, foam.__context__);
  });
}


var createData2 = function createData2() {
  var arr = [];
  var count = 20;

  for (var i = 0; i < count; i++ ) {
    arr.push({
      int: i,
      float: count - i,
      string: 'hello' + ( i % (count / 4) ),
      date: new Date(0)
    });
  }

  return arr.map(function(cfg) {
    return test.Indexable.create(cfg, foam.__context__);
  });
}

var createData3 = function createData3() {
  return [
    {
      int: 0,
      float: 0.0,
      string: "",
      date: new Date(0),
      array: ['hello', 'bye']
    },
    {
      int: 1,
      float: 1.1,
      string: "one!",
      date: new Date(1),
      array: ['apple', 'banana','kiwi']
    },
  ].map(function(cfg) {
    return test.Indexable.create(cfg, foam.__context__);
  });
}

var callPlan = function callPlan(idx, sink, pred) {
  var plan = idx.plan(sink, undefined, undefined, undefined, pred);
  plan.execute([], sink, undefined, undefined, undefined, pred);
  return plan;
}

describe('Index interface', function() {
  it('has enough methods', function() {
    var idxFac = foam.dao.index.Index.create();
    idxFac.create({ });

    idxFac.put();
    idxFac.remove();
    idxFac.plan(/*sink, skip, limit, order, predicate*/);
    idxFac.get();
    idxFac.size();
    idxFac.select(/*sink, skip, limit, order, predicate*/);
    idxFac.selectReverse(/*sink, skip, limit, order, predicate*/);
  });

});


describe('ValueIndex', function() {

  var data;
  var idx;

  beforeEach(function() {
    data = createData1();
    idx = foam.dao.index.ValueIndex.create();
  });

  it('stores a value', function() {
    idx.put(data[0]);
    expect(idx.get()).toBe(data[0]);
  });
  it('clears its value', function() {
    idx.put(data[0]);
    expect(idx.get()).toBe(data[0]);
    idx.remove();
    expect(idx.get()).toBeUndefined();
  });
  it('selects when skip and limit allow', function() {
    idx.put(data[0]);

    var sink = { put: function(o) { this.putted = o; } };

    idx.select(sink);
    expect(sink.putted).toBe(data[0]);
    delete sink.putted;

    var skip = [2];
    idx.select(sink, skip);
    expect(sink.putted).toBeUndefined(); // skipped
    expect(skip[0]).toEqual(1); // skip decremented
    delete sink.putted;

    var limit = [3];
    idx.select(sink, undefined, limit);
    expect(sink.putted).toBe(data[0]); // not at limit
    expect(limit[0]).toEqual(2); // limit decremented
    delete sink.putted;

    skip = [1];
    limit = [3];
    idx.select(sink, skip, limit);
    expect(sink.putted).toBeUndefined(); // skip
    expect(skip[0]).toEqual(0);
    expect(limit[0]).toEqual(3);
    delete sink.putted;
    idx.select(sink, skip, limit);
    expect(sink.putted).toBe(data[0]); // not at limit
    expect(limit[0]).toEqual(2);
    delete sink.putted;
    idx.select(sink, skip, limit);
    expect(sink.putted).toBe(data[0]); // not at limit
    expect(limit[0]).toEqual(1);
    delete sink.putted;
    idx.select(sink, skip, limit);
    expect(sink.putted).toBe(data[0]); // not at limit
    expect(limit[0]).toEqual(0);
    delete sink.putted;
    idx.select(sink, skip, limit);
    expect(sink.putted).toBeUndefined(); // at limit
    expect(limit[0]).toEqual(-1);
    delete sink.putted;


  });

  it('selects when predicate allows', function() {
    idx.put(data[0]);

    var sink = { put: function(o) { this.putted = o; } };

    var predicate = { f: function() { return false; } };
    idx.select(sink, undefined, undefined, undefined, predicate);
    expect(sink.putted).toBeUndefined();
    delete sink.putted;

    predicate = { f: function() { return true; } };
    idx.select(sink, undefined, undefined, undefined, predicate);
    expect(sink.putted).toBe(data[0]);
    delete sink.putted;

  });

  it('returns proper size', function() {
    expect(idx.size()).toEqual(0);
    idx.put(data[0]);
    expect(idx.size()).toEqual(1);
    idx.put(data[1]);
    expect(idx.size()).toEqual(1);
    idx.remove();
    expect(idx.size()).toEqual(0);
  });

  it('covers toString()', function() {
    idx.toString(); // empty
    idx.put(data[0]);
    idx.toString(); // with value
  });


});


describe('ValueIndex (as Plan)', function() {

  var data;
  var idx;
  var plan;

  beforeEach(function() {
    data = createData1();
    idx = foam.dao.index.ValueIndex.create();
  });

  it('plans for no value', function() {
    plan = idx.plan();

    var sink = { put: function(o) { this.putted = o; } };

    expect(plan.cost).toEqual(1);
    plan.execute([/*promise*/], sink);
    expect(sink.putted).toBeUndefined();
    delete sink.putted;
  });


  it('plans for a value', function() {
    idx.put(data[0]);
    plan = idx.plan();

    var sink = { put: function(o) { this.putted = o; } };

    expect(plan.cost).toEqual(1);
    plan.execute([/*promise*/], sink);
    expect(sink.putted).toBe(data[0]);
    delete sink.putted;
  });

});


describe('TreeIndex', function() {


  var data;
  var idx;
  var plan;
  var m;
  var sink;

  beforeEach(function() {
    data = createData2();
    idx = foam.dao.index.TreeIndex.create({
      prop: test.Indexable.INT,
      tailFactory: foam.dao.index.TreeIndex.create({
        prop: test.Indexable.FLOAT,
        tailFactory: foam.dao.index.ValueIndex.create()
      })
    });
    idx.bulkLoad(data);
    m = foam.mlang.Expressions.create();
    sink = foam.dao.ArraySink.create();
  });

  it('covers toString()', function() {
    plan = idx.plan(sink);

    // cover
    plan.toString();
    idx.toString();
  });

  it('optimizes IN', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.IN(test.Indexable.INT, [ 0, 1, 2 ]));

    // Note: this is checking an implementation detail
    // Each item in the In array produces a plan
    expect(foam.dao.index.AltPlan.isInstance(plan)).toEqual(true);
    expect(plan.subPlans.length).toEqual(3);

    plan.execute([], sink);

    expect(sink.a.length).toEqual(3);
    expect(sink.a[0].int).toEqual(0);
    expect(sink.a[1].int).toEqual(1);
    expect(sink.a[2].int).toEqual(2);
  });

  it('optimizes IN with a cloned predicate', function() {
    var pred = m.IN(test.Indexable.INT, [ 0, 1, 2 ]);
    pred = pred.clone(); // case where Property INT being cloned too

    plan = idx.plan(sink, undefined, undefined, undefined, pred);

    // Note: this is checking an implementation detail
    // Each item in the In array produces a plan
    expect(foam.dao.index.AltPlan.isInstance(plan)).toEqual(true);
    expect(plan.subPlans.length).toEqual(3);

    plan.execute([], sink);

    expect(sink.a.length).toEqual(3);
    expect(sink.a[0].int).toEqual(0);
    expect(sink.a[1].int).toEqual(1);
    expect(sink.a[2].int).toEqual(2);
  });

  it('optimizes not found IN', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.IN(test.Indexable.INT, [ 22, 25 ]));

    expect(foam.dao.index.NotFoundPlan.isInstance(plan)).toEqual(true);

    plan.execute([], sink);

    expect(sink.a.length).toEqual(0);
  });

  it('optimizes EQ', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.INT, 4));

    // Note: this is checking an implementation detail
    expect(foam.dao.index.AltPlan.isInstance(plan)).toEqual(true);
    expect(plan.subPlans.length).toEqual(1);

    plan.execute([], sink);

    expect(sink.a.length).toEqual(1);
    expect(sink.a[0].int).toEqual(4);
  });

  it('optimizes not found EQ', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.INT, 56));

    expect(foam.dao.index.NotFoundPlan.isInstance(plan)).toEqual(true);

    plan.execute([], sink);

    expect(sink.a.length).toEqual(0);
  });

  it('optimizes False', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      foam.mlang.predicate.False.create());

    expect(foam.dao.index.NotFoundPlan.isInstance(plan)).toEqual(true);

    plan.execute([], sink);
    expect(sink.a.length).toEqual(0);
  });


  it('optimizes range searches', function() {
    var pred = m.AND(
        m.GT(test.Indexable.FLOAT, 12),
        m.LT(test.Indexable.FLOAT, 18),
        m.GTE(test.Indexable.INT, 3),
        m.LTE(test.Indexable.INT, 10)
      );
    plan = idx.plan(sink, undefined, undefined, undefined, pred);

    plan.execute([], sink, undefined, undefined, undefined, pred);

    expect(sink.a.length).toEqual(5);
    expect(sink.a[0].int).toEqual(3);
    expect(sink.a[1].int).toEqual(4);
    expect(sink.a[2].int).toEqual(5);
    expect(sink.a[3].int).toEqual(6);
    expect(sink.a[4].int).toEqual(7);

  });


//   it('optimizes True', function() {
//     // not a valid case
//     var baseEq = m.EQ(test.Indexable.INT, 4);
//     var fakePredicate = {
//       __proto__: baseEq,
//       f: function() { return true; },
//       partialEval: function() { return foam.mlang.predicate.True.create(); }
//     }

//     plan = idx.plan(sink, undefined, undefined, undefined,
//       m.AND(
//         fakePredicate,
//         fakePredicate
//       )
//     );

//     //expect(foam.dao.index.NotFoundPlan.isInstance(plan)).toEqual(true);

//     plan.execute([], sink);
//     expect(sink.a.length).toEqual(data.length);
//   });



});


describe('Case-Insensitive TreeIndex', function() {
  var data;
  var idx;
  var plan;
  var m;
  var sink;

  beforeEach(function() {
    data = createData1();
    idx = foam.dao.index.CITreeIndex.create({
      prop: test.Indexable.STRING,
      tailFactory: foam.dao.index.TreeIndex.create({
        prop: test.Indexable.INT,
        tailFactory: foam.dao.index.ValueIndex.create()
      })
    });
    idx.bulkLoad(data);
    m = foam.mlang.Expressions.create();
    sink = foam.dao.ArraySink.create();
  });

  it('puts case-insensitive', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.STRING, 'three'));
    plan.execute([], sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.STRING, 'three'));

    expect(sink.a.length).toEqual(1);
    expect(sink.a[0].string).toEqual('three');


    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.STRING, 'one!'));
    plan.execute([], sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.STRING, 'one!'));

    expect(sink.a.length).toEqual(3);
    expect(sink.a[1].string).toEqual('one!');
    expect(sink.a[2].string).toEqual('one!');
  });

  it('removes case-insensitive', function() {
    // Remove both '3' items: ids 3 and 4, but setting both strings to
    // capitalized value to make sure CI accepts both
    var newData = data[3].clone();
    newData.string = 'Three';
    idx.remove(newData);

    newData = data[4].clone();
    newData.string = 'Three';
    idx.remove(newData);

    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.STRING, 'three')
    );
    plan.execute([], sink);

    expect(sink.a.length).toEqual(0);
  });
});


describe('SetIndex', function() {
  var data;
  var idx;
  var plan;
  var m;
  var sink;

  beforeEach(function() {
    data = createData3();
    idx = foam.dao.index.SetIndex.create({
      prop: test.Indexable.ARRAY,
      tailFactory: foam.dao.index.ValueIndex.create()
    });
    idx.bulkLoad(data);
    m = foam.mlang.Expressions.create();
    sink = foam.dao.ArraySink.create();
  });

  it('finds based on array values', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.ARRAY, 'banana')
    );
    plan.execute([], sink);

    expect(sink.a.length).toEqual(1);
    expect(sink.a[0].int).toEqual(1);

    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.ARRAY, 'hello')
    );
    plan.execute([], sink);

    expect(sink.a.length).toEqual(2);
    expect(sink.a[1].int).toEqual(0);
  });

  it('removes based on array values', function() {
    idx.remove(data[0]);

    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.ARRAY, 'banana')
    );
    plan.execute([], sink);

    expect(sink.a.length).toEqual(1);
    expect(sink.a[0].int).toEqual(1);

    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.ARRAY, 'hello')
    );
    plan.execute([], sink);

    expect(sink.a.length).toEqual(1);

  });


});

describe('Plan', function() {
  it('covers toString()', function() {
    foam.dao.index.Plan.create().toString();
    foam.dao.index.NotFoundPlan.create().toString();
    foam.dao.index.NoPlan.create().toString();
    foam.dao.index.CustomPlan.create().toString();
    foam.dao.index.CountPlan.create().toString();
    foam.dao.index.AltPlan.create().toString();
  });
});


describe('AltIndex', function() {
  var data;
  var idx;
  var plan;
  var m;
  var sink;

  beforeEach(function() {
    data = createData2();
    idx = foam.dao.index.AltIndex.create({
      delegates: [
        foam.dao.index.TreeIndex.create({
          prop: test.Indexable.INT,
          tailFactory: foam.dao.index.ValueIndex.create()
        }),
        foam.dao.index.TreeIndex.create({
          prop: test.Indexable.FLOAT,
          tailFactory: foam.dao.index.ValueIndex.create()
        }),
      ]
    });
    idx.GOOD_ENOUGH_PLAN = 100; // don't short circuit for test
    idx.bulkLoad(data);
    m = foam.mlang.Expressions.create();
    sink = foam.dao.ArraySink.create();
  });

  it('Picks correct index for query', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.INT, 4)
    );

    expect(plan.cost).toBeLessThan(data.length/2);

    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.FLOAT, 4)
    );

    expect(plan.cost).toBeLessThan(data.length/2);
  });

  it('removes items from all indexes', function() {
    idx.remove(data[0]);

    plan = callPlan(idx, sink, m.EQ(test.Indexable.FLOAT, data[0].float));
    expect(sink.a.length).toEqual(0);

    plan = callPlan(idx, sink, m.EQ(test.Indexable.INT, data[0].int));
    expect(sink.a.length).toEqual(0);

    // puts back
    idx.put(data[0]);
    plan = callPlan(idx, sink, m.EQ(test.Indexable.FLOAT, data[0].float));
    expect(sink.a.length).toEqual(1);

    plan = callPlan(idx, sink, m.EQ(test.Indexable.INT, data[0].int));
    expect(sink.a.length).toEqual(2);

  });

  it('covers get()', function() {
    expect(idx.get(4)).not.toBeUndefined();
  });
  it('covers size()', function() {
    expect(idx.size()).toEqual(data.length);
  });
  it('covers toString()', function() {
    idx.toString();
  });
});

describe('AutoIndex', function() {
  var idx;
  var plan;
  var m;
  var sink;
  var mdao;

  beforeEach(function() {
    mdao = {
      lastIndex: null,
      addPropertyIndex: function(index) {
        this.lastIndex = index;
      }
    }
    idx = foam.dao.index.AutoIndex.create({
      mdao: mdao
    }, foam.__context__);
    m = foam.mlang.Expressions.create();
    sink = foam.dao.ArraySink.create();
  });

  it('covers unimplemented put(), remove(), buldLoad()', function() {
    idx.put();
    idx.remove();
    idx.bulkLoad();
  });
  it('covers toString()', function() {
    idx.toString();
  });

  it('supports manual addPropertyIndex()', function() {
    idx.addPropertyIndex(test.Indexable.INT);

    expect(idx.properties['int']).toEqual(true);
    expect(mdao.lastIndex).toBe(test.Indexable.INT);
  });

  it('auto indexes on ordering', function() {
    idx.plan(sink, undefined, undefined, test.Indexable.FLOAT);

    expect(idx.properties['float']).toEqual(true);
    expect(mdao.lastIndex).toBe(test.Indexable.FLOAT);

    idx.plan(sink, undefined, undefined, m.DESC(test.Indexable.INT));

    expect(idx.properties['int']).toEqual(true);
    expect(mdao.lastIndex).toBe(test.Indexable.INT);
  });

  it('skips already auto indexed orderings', function() {
    idx.plan(sink, undefined, undefined, test.Indexable.FLOAT);

    expect(idx.properties['float']).toEqual(true);
    expect(mdao.lastIndex).toBe(test.Indexable.FLOAT);

    mdao.lastIndex = null;

    idx.plan(sink, undefined, undefined, m.DESC(test.Indexable.FLOAT));

    expect(idx.properties['float']).toEqual(true);
    expect(mdao.lastIndex).toBe(null);
  });

  // it('auto indexes on predicate', function() {
  //   idx.plan(...)
  //
  //   expect(idx.properties['float']).toEqual(true);
  //   expect(mdao.lastIndex).toBe(test.Indexable.FLOAT);
  // });

});
