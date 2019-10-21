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

  ids: ['int'],

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


var createData2 = function createData2(dataCount) {
  var arr = [];
  var count = dataCount || 20;

  for ( var i = 0 ; i < count ; i++ ) {
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
    idxFac.estimate();

    var tail = idxFac.createNode({ });
    tail.put();
    tail.remove();
    tail.plan(/*sink, skip, limit, order, predicate*/);
    tail.get();
    tail.size();
    tail.select(/*sink, skip, limit, order, predicate*/);
  });

});


describe('ValueIndex', function() {

  var data;
  var idx;

  beforeEach(function() {
    data = createData1();
    idx = foam.dao.index.ValueIndex.create().createNode();
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
    idx = foam.dao.index.ValueIndex.create().createNode();
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
      tail: foam.dao.index.TreeIndex.create({
        prop: test.Indexable.FLOAT,
        tail: foam.dao.index.ValueIndex.create()
      })
    }).createNode();
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
    expect(plan.subPlans.length).toEqual(3);

    plan.execute([], sink);

    expect(sink.array.length).toEqual(3);
    expect(sink.array[0].int).toEqual(0);
    expect(sink.array[1].int).toEqual(1);
    expect(sink.array[2].int).toEqual(2);
  });

  it('optimizes IN with a cloned predicate', function() {
    var pred = m.IN(test.Indexable.INT, [ 0, 1, 2 ]);
    pred = pred.clone(); // case where Property INT being cloned too

    plan = idx.plan(sink, undefined, undefined, undefined, pred);

    // Note: this is checking an implementation detail
    // Each item in the In array produces a plan
    expect(plan.subPlans.length).toEqual(3);

    plan.execute([], sink);

    expect(sink.array.length).toEqual(3);
    expect(sink.array[0].int).toEqual(0);
    expect(sink.array[1].int).toEqual(1);
    expect(sink.array[2].int).toEqual(2);
  });

  it('optimizes not found IN', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.IN(test.Indexable.INT, [ 22, 25 ]));

    expect(foam.dao.index.NotFoundPlan.isInstance(plan)).toEqual(true);

    plan.execute([], sink);

    expect(sink.array.length).toEqual(0);
  });

  it('optimizes EQ', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.INT, 4));

    plan.execute([], sink);

    expect(sink.array.length).toEqual(1);
    expect(sink.array[0].int).toEqual(4);
  });

  it('optimizes not found EQ', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.INT, 56));

    expect(foam.dao.index.NotFoundPlan.isInstance(plan)).toEqual(true);

    plan.execute([], sink);

    expect(sink.array.length).toEqual(0);
  });

  it('optimizes False', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      foam.mlang.predicate.False.create());

    expect(foam.dao.index.NotFoundPlan.isInstance(plan)).toEqual(true);

    plan.execute([], sink);
    expect(sink.array.length).toEqual(0);
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

    expect(sink.array.length).toEqual(5);
    expect(sink.array[0].int).toEqual(3);
    expect(sink.array[1].int).toEqual(4);
    expect(sink.array[2].int).toEqual(5);
    expect(sink.array[3].int).toEqual(6);
    expect(sink.array[4].int).toEqual(7);

  });

  it('orders scans', function() {
    idx = foam.dao.index.TreeIndex.create({
      prop: test.Indexable.STRING,
      tail: foam.dao.index.TreeIndex.create({
        prop: test.Indexable.INT,
        tail: foam.dao.index.ValueIndex.create()
      })
    }).createNode();
    idx.bulkLoad(data);

    var order = m.THEN_BY(test.Indexable.STRING, test.Indexable.INT);

    plan = idx.plan(sink, undefined, undefined, order);

    plan.execute([], sink, undefined, undefined, order);

    expect(sink.array.length).toEqual(20);
    expect(sink.array[0].int).toEqual(0);
    expect(sink.array[1].int).toEqual(5);
    expect(sink.array[2].int).toEqual(10);
    expect(sink.array[3].int).toEqual(15);

    expect(sink.array[4].int).toEqual(1);
    expect(sink.array[5].int).toEqual(6);
    expect(sink.array[6].int).toEqual(11);
    expect(sink.array[7].int).toEqual(16);

    expect(sink.array[8].int).toEqual(2);
    expect(sink.array[9].int).toEqual(7);
    expect(sink.array[10].int).toEqual(12);
    expect(sink.array[11].int).toEqual(17);

    expect(sink.array[12].int).toEqual(3);
    expect(sink.array[13].int).toEqual(8);
    expect(sink.array[14].int).toEqual(13);
    expect(sink.array[15].int).toEqual(18);

    expect(sink.array[16].int).toEqual(4);
    expect(sink.array[17].int).toEqual(9);
    expect(sink.array[18].int).toEqual(14);
    expect(sink.array[19].int).toEqual(19);
  });

  it('orders reverse scans', function() {
    idx = foam.dao.index.TreeIndex.create({
      prop: test.Indexable.STRING,
      tail: foam.dao.index.TreeIndex.create({
        prop: test.Indexable.INT,
        tail: foam.dao.index.ValueIndex.create()
      })
    }).createNode();
    idx.bulkLoad(data);

    var order = m.THEN_BY(test.Indexable.STRING, m.DESC(test.Indexable.INT));

    plan = idx.plan(sink, undefined, undefined, order);

    plan.execute([], sink, undefined, undefined, order);

    // string is generated in groups of 5, so sort by string
    // then reverse sort int will have reversed groups of 5
    // ints
    expect(sink.array.length).toEqual(20);


    expect(sink.array[0].string).toEqual('hello0');
    expect(sink.array[0].int).toEqual(15);
    expect(sink.array[1].int).toEqual(10);
    expect(sink.array[2].int).toEqual(5);
    expect(sink.array[3].int).toEqual(0);

    expect(sink.array[4].string).toEqual('hello1');
    expect(sink.array[4].int).toEqual(16);
    expect(sink.array[5].int).toEqual(11);
    expect(sink.array[6].int).toEqual(6);
    expect(sink.array[7].int).toEqual(1);

    expect(sink.array[8].string).toEqual('hello2');
    expect(sink.array[8].int).toEqual(17);
    expect(sink.array[9].int).toEqual(12);
    expect(sink.array[10].int).toEqual(7);
    expect(sink.array[11].int).toEqual(2);

    expect(sink.array[12].string).toEqual('hello3');
    expect(sink.array[12].int).toEqual(18);
    expect(sink.array[13].int).toEqual(13);
    expect(sink.array[14].int).toEqual(8);
    expect(sink.array[15].int).toEqual(3);

    expect(sink.array[16].string).toEqual('hello4');
    expect(sink.array[16].int).toEqual(19);
    expect(sink.array[17].int).toEqual(14);
    expect(sink.array[18].int).toEqual(9);
    expect(sink.array[19].int).toEqual(4);


  });

  it('orders reverse scans with an AltIndex', function() {
    idx = foam.dao.index.TreeIndex.create({
      prop: test.Indexable.STRING,
      tail: foam.dao.index.AltIndex.create({
        delegates: [
          test.Indexable.ID.toIndex(foam.dao.index.ValueIndex.create()),
          test.Indexable.INT.toIndex(
            test.Indexable.ID.toIndex(foam.dao.index.ValueIndex.create())
          )
        ]
      })
    }).createNode();
    idx.bulkLoad(data);

    var order = m.THEN_BY(test.Indexable.STRING, m.DESC(test.Indexable.INT));

    plan = idx.plan(sink, undefined, undefined, order);

    plan.execute([], sink, undefined, undefined, order);

    // string is generated in groups of 5, so sort by string
    // then reverse sort int will have reversed groups of 5
    // ints
    expect(sink.array.length).toEqual(20);


    expect(sink.array[0].string).toEqual('hello0');
    expect(sink.array[0].int).toEqual(15);
    expect(sink.array[1].int).toEqual(10);
    expect(sink.array[2].int).toEqual(5);
    expect(sink.array[3].int).toEqual(0);

    expect(sink.array[4].string).toEqual('hello1');
    expect(sink.array[4].int).toEqual(16);
    expect(sink.array[5].int).toEqual(11);
    expect(sink.array[6].int).toEqual(6);
    expect(sink.array[7].int).toEqual(1);

    expect(sink.array[8].string).toEqual('hello2');
    expect(sink.array[8].int).toEqual(17);
    expect(sink.array[9].int).toEqual(12);
    expect(sink.array[10].int).toEqual(7);
    expect(sink.array[11].int).toEqual(2);

    expect(sink.array[12].string).toEqual('hello3');
    expect(sink.array[12].int).toEqual(18);
    expect(sink.array[13].int).toEqual(13);
    expect(sink.array[14].int).toEqual(8);
    expect(sink.array[15].int).toEqual(3);

    expect(sink.array[16].string).toEqual('hello4');
    expect(sink.array[16].int).toEqual(19);
    expect(sink.array[17].int).toEqual(14);
    expect(sink.array[18].int).toEqual(9);
    expect(sink.array[19].int).toEqual(4);


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
//     expect(sink.array.length).toEqual(data.length);
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
      tail: foam.dao.index.TreeIndex.create({
        prop: test.Indexable.INT,
        tail: foam.dao.index.ValueIndex.create()
      })
    }).createNode();
    idx.bulkLoad(data);
    m = foam.mlang.Expressions.create();
    sink = foam.dao.ArraySink.create();
  });

  it('puts case-insensitive', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.STRING, 'three'));
    plan.execute([], sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.STRING, 'three'));

    expect(sink.array.length).toEqual(1);
    expect(sink.array[0].string).toEqual('three');


    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.STRING, 'one!'));
    plan.execute([], sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.STRING, 'one!'));

    expect(sink.array.length).toEqual(3);
    expect(sink.array[1].string).toEqual('one!');
    expect(sink.array[2].string).toEqual('one!');
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

    expect(sink.array.length).toEqual(0);
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
      tail: foam.dao.index.ValueIndex.create()
    }).createNode();
    idx.bulkLoad(data);
    m = foam.mlang.Expressions.create();
    sink = foam.dao.ArraySink.create();
  });

  it('finds based on array values', function() {
    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.ARRAY, 'banana')
    );
    plan.execute([], sink);

    expect(sink.array.length).toEqual(1);
    expect(sink.array[0].int).toEqual(1);

    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.ARRAY, 'hello')
    );
    plan.execute([], sink);

    expect(sink.array.length).toEqual(2);
    expect(sink.array[1].int).toEqual(0);
  });

  it('removes based on array values', function() {
    idx.remove(data[0]);

    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.ARRAY, 'banana')
    );
    plan.execute([], sink);

    expect(sink.array.length).toEqual(1);
    expect(sink.array[0].int).toEqual(1);

    plan = idx.plan(sink, undefined, undefined, undefined,
      m.EQ(test.Indexable.ARRAY, 'hello')
    );
    plan.execute([], sink);

    expect(sink.array.length).toEqual(1);

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
    foam.dao.index.MergePlan.create().toString();
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
      delegates: [ test.Indexable.INT.toIndex(foam.dao.index.ValueIndex.create()) ]
    }).createNode();
    var fakeRoot = {
      size: function() { return 1; },
      index: { toPrettyString: function() { return ""; }}
    };
    idx.addIndex(foam.dao.index.TreeIndex.create({
      prop: test.Indexable.INT,
      tail: foam.dao.index.ValueIndex.create()
    }), fakeRoot );
    idx.addIndex(foam.dao.index.TreeIndex.create({
      prop: test.Indexable.FLOAT,
      tail: foam.dao.index.ValueIndex.create()
    }), fakeRoot );
    idx.index.GOOD_ENOUGH_PLAN = 1; // don't short circuit for test
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
    expect(sink.array.length).toEqual(0);

    plan = callPlan(idx, sink, m.EQ(test.Indexable.INT, data[0].int));
    expect(sink.array.length).toEqual(0);

    // puts back
    idx.put(data[0]);
    plan = callPlan(idx, sink, m.EQ(test.Indexable.FLOAT, data[0].float));
    expect(sink.array.length).toEqual(1);

    plan = callPlan(idx, sink, m.EQ(test.Indexable.INT, data[0].int));
    expect(sink.array.length).toEqual(2);
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

describe('AND', function() {
  var m;

  beforeEach(function() {
    m = foam.mlang.Expressions.create();
  });

  it('chains subindexes by cost estimate', function() {
    var and = m.AND(
      m.GT(test.Indexable.INT, 5),
      m.EQ(test.Indexable.FLOAT, 5),
      m.IN(test.Indexable.STRING, 'he')
    );
    var andIndex = and.toIndex(
      test.Indexable.ID.toIndex(foam.dao.index.ValueIndex.create())
    );

    expect(andIndex.prop).toEqual(test.Indexable.FLOAT);
    expect(andIndex.tail.prop).toEqual(test.Indexable.STRING);
    expect(andIndex.tail.tail.prop).toEqual(test.Indexable.INT);
  });

  it('returns best by cost estimate when depth == 1', function() {
    var and = m.AND(
      m.GT(test.Indexable.INT, 5),
      m.EQ(test.Indexable.FLOAT, 5),
      m.IN(test.Indexable.STRING, 'he')
    );
    var andIndex = and.toIndex(
      test.Indexable.ID.toIndex(foam.dao.index.ValueIndex.create()),
      1
    );

    expect(andIndex.prop).toEqual(test.Indexable.FLOAT);

  });

});




describe('AutoIndex', function() {
  var idx;
  var idxInstance;
  var plan;
  var m;
  var sink;
  var mdao;
  var fakeRoot;

  beforeEach(function() {
    idx = foam.dao.index.AutoIndex.create({
      idIndex: test.Indexable.ID.toIndex(foam.dao.index.ValueIndex.create())
    });

    idxInstance = idx.createNode();

    idxInstance.bulkLoad(createData2(1000));

    fakeRoot = {
      size: function() { return 1; },
      index: { toPrettyString: function() { return ""; }}
    };

    m = foam.mlang.Expressions.create();
    sink = foam.dao.ArraySink.create();
  });

  it('covers toString()', function() {
    idx.toString();
  });

  it('supports manual addIndex()', function() {
    idxInstance.addPropertyIndex(test.Indexable.INT, idxInstance);
    expect(idxInstance.delegate.delegates.length).toEqual(2);
    expect(idxInstance.delegate.delegates[1].size()).toEqual(1000);
  });

  it('auto indexes on ordering', function() {
    idxInstance
      .plan(sink, undefined, undefined, test.Indexable.FLOAT, undefined, fakeRoot)
      .execute([], sink, undefined, undefined, test.Indexable.FLOAT, undefined);

    expect(idxInstance.delegate.delegates.length).toEqual(2);
    expect(idxInstance.delegate.delegates[1].size()).toEqual(1000);

    idxInstance
      .plan(sink, undefined, undefined, m.DESC(test.Indexable.INT), undefined, fakeRoot)
      .execute([], sink, undefined, undefined, m.DESC(test.Indexable.INT), undefined);

    expect(idxInstance.delegate.delegates.length).toEqual(3);
    expect(idxInstance.delegate.delegates[1].size()).toEqual(1000);
    expect(idxInstance.delegate.delegates[2].size()).toEqual(1000);

  });

  it('skips already auto indexed orderings', function() {
    idxInstance
      .plan(sink, undefined, undefined, test.Indexable.FLOAT, undefined, fakeRoot)
      .execute([], sink, undefined, undefined, test.Indexable.FLOAT, undefined);

    expect(idxInstance.delegate.delegates.length).toEqual(2);
    expect(idxInstance.delegate.delegates[1].size()).toEqual(1000);

    idxInstance
      .plan(sink, undefined, undefined, m.DESC(test.Indexable.FLOAT), undefined, fakeRoot)
      .execute([], sink, undefined, undefined, m.DESC(test.Indexable.FLOAT), undefined);

    expect(idxInstance.delegate.delegates.length).toEqual(2);
    expect(idxInstance.delegate.delegates[1].size()).toEqual(1000);
  });

  it('auto indexes on predicate', function() {

    var pred = m.AND(
      m.OR(
        m.LT(test.Indexable.INT, 8),
        m.EQ(test.Indexable.FLOAT, 4)
      ),
      m.CONTAINS_IC(test.Indexable.STRING, "we"),
      m.OR(
        m.GT(test.Indexable.INT, 8),
        m.LTE(test.Indexable.FLOAT, 4)
      )
    );

    pred = m.OR(
      pred,
      m.AND(
        m.CONTAINS_IC(test.Indexable.STRING, "we"),
        m.EQ(test.Indexable.DATE, new Date())
      )
    );

    pred = pred.toDisjunctiveNormalForm();

    // the results end up small enough that the first index is good enough
    // for all subpred cases
    for ( var i = 0; i < pred.args.length; i++ ) {
      var subpred = pred.args[i];
      idxInstance
        .plan(sink, undefined, undefined, undefined, subpred, fakeRoot)
        .execute([], sink, undefined, undefined, undefined, subpred);
    }
    expect(idxInstance.delegate.delegates.length).toEqual(2);
    expect(idxInstance.delegate.delegates[1].size()).toEqual(1000);
  });

  it('dnf works with NOT', function() {

    var pred = m.OR(
      m.NOT(m.HAS(test.Indexable.STRING)),
      m.EQ(test.Indexable.STRING, 'none')
    );

    pred = pred.toDisjunctiveNormalForm();
  });



  it('auto indexes on more predicates', function() {

    var preds = [
      m.AND(
        m.LT(test.Indexable.INT, 8),
        m.EQ(test.Indexable.FLOAT, 4)
      ),
      m.CONTAINS_IC(test.Indexable.STRING, "we"),
      m.LT(test.Indexable.DATE, 8)
    ];

    // the results end up small enough that the first index is good enough
    // for all subpred cases
    for ( var i = 0; i < preds.length; i++ ) {
      var subpred = preds[i];
      idxInstance
        .plan(sink, undefined, undefined, undefined, subpred, fakeRoot)
        .execute([], sink, undefined, undefined, undefined, subpred);

      expect(idxInstance.delegate.delegates.length).toEqual(i+2);
      expect(idxInstance.delegate.delegates[i+1].size()).toEqual(1000);
    }
  });

});



describe('MergePlan', function() {
  var plan;
  var sink;

  function generateData(count) {
    // prop 'a' values overlap, prop 'b' half-overlaps and is reversed
    var ret = { setA: [], setB: [] };

    for ( var i = 0; i < count; i++ ) {
      ret.setA.push(test.MergePlanTestData.create({
        a: i,
        b: count - i
      }));
    }
    for ( var i = count / 2; i < count * 1.5; i++ ) {
      ret.setB.push(test.MergePlanTestData.create({
        a: i,
        b: count - i
      }));
    }

    return ret;
  };

  function generateDupeData(count) {
    // generates
    var ret = { setA: [] };

    for ( var i = 0; i < count; i++ ) {
      ret.setA.push(test.MergePlanTestData.create({
        a: i,
        b: Math.trunc(i / 4)
      }));
    }

    return ret;
  };


  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'MergePlanTestData',
      ids: ['a'],
      properties: [
        { name: 'a' },
        { name: 'b', class:'Date' }
      ]
    });

    plan = foam.dao.index.MergePlan.create({ of: 'test.MergePlanTestData' });
    sink = foam.dao.ArraySink.create();
  });

  it('handles empty input', function() {
    plan.execute([], sink);
    expect(sink.array.length).toBe(0);
  });

  it('handles empty input with ordering', function() {
    var ordering = test.MergePlanTestData.B;

    plan.execute([], sink, undefined, undefined, ordering);
    expect(sink.array.length).toBe(0);
  });

  it('handles a single subplan', function() {
    var data = generateData(10);

    plan.subPlans = [
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 0; i < 10; i++ ) {
            sink.put(data.setA[i]);
          }
        }
      })
    ];

    plan.execute([], sink);
    expect(sink.array.length).toBe(10);
  });

  it('handles a single subplan with ordering', function() {
    var data = generateData(10);

    var ordering = test.MergePlanTestData.B;

    plan.subPlans = [
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 0; i < 10; i++ ) {
            sink.put(data.setA[9 - i]);
          }
        }
      })
    ];

    plan.execute([], sink, undefined, undefined, ordering);
    expect(sink.array.length).toBe(10);
    expect(sink.array[0].b).toEqual(new Date(1)); // should be ordered by 'b'
    expect(sink.array[9].b).toEqual(new Date(10));
  });

  it('deduplicates with ordering', function() {
    var data = generateData(10);

    var ordering = test.MergePlanTestData.A;

    plan.subPlans = [
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 0; i < 5; i++ ) {
            sink.put(data.setA[i]);
          }
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 0; i < 5; i++ ) { // put dupes of first 5
            sink.put(data.setA[i]);
          }
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 5; i < 10; i++ ) { // finish last 5 items
            sink.put(data.setA[i]);
          }
        }
      }),
    ];

    plan.execute([], sink, undefined, undefined, ordering);
    expect(sink.array.length).toBe(10);
    expect(sink.array[0].a).toBe(0);
    expect(sink.array[1].a).toBe(1);
    expect(sink.array[2].a).toBe(2);
    expect(sink.array[9].a).toBe(9);
  });

  it('deduplicates', function() {
    var data = generateData(10);

    plan.subPlans = [
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 0; i < 5; i++ ) {
            sink.put(data.setA[i]);
          }
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 0; i < 5; i++ ) { // put dupes of first 5
            sink.put(data.setA[i]);
          }
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 5; i < 10; i++ ) { // finish last 5 items
            sink.put(data.setA[i]);
          }
        }
      }),
    ];

    plan.execute([], sink);
    expect(sink.array.length).toBe(10);
    expect(sink.array[0].a).toBe(0);
    expect(sink.array[1].a).toBe(1);
    expect(sink.array[2].a).toBe(2);
    expect(sink.array[9].a).toBe(9);
  });


  it('deduplicates clones (different object, but same id and values)', function() {
    var data = generateData(10);

    plan.subPlans = [
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 0; i < 5; i++ ) {
            sink.put(data.setA[i]);
          }
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 0; i < 5; i++ ) { // put cloned dupes of first 5
            sink.put(data.setA[i].clone());
          }
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 5; i < 10; i++ ) { // finish last 5 items
            sink.put(data.setA[i]);
          }
        }
      }),
    ];

    plan.execute([], sink);
    expect(sink.array.length).toBe(10);
    expect(sink.array[0].a).toBe(0);
    expect(sink.array[1].a).toBe(1);
    expect(sink.array[2].a).toBe(2);
    expect(sink.array[9].a).toBe(9);
  });

  it('merges results', function() {
    var data = generateData(10);
    var ordering = test.MergePlanTestData.B;

    plan.subPlans = [
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 9; i >= 0; i-- ) {
            sink.put(data.setA[i]);
          }
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 9; i >= 0; i-- ) {
            sink.put(data.setB[i]);
          }
        }
      }),
    ];

    plan.execute([], sink, undefined, undefined, ordering);

    expect(sink.array.length).toBe(15);

      expect(sink.array[0].a).toBe(14); expect(sink.array[0].b).toEqual(new Date(-4));
    expect(sink.array[1].a).toBe(13); expect(sink.array[1].b).toEqual(new Date(-3));
    expect(sink.array[2].a).toBe(12); expect(sink.array[2].b).toEqual(new Date(-2));
    expect(sink.array[3].a).toBe(11); expect(sink.array[3].b).toEqual(new Date(-1));
    expect(sink.array[4].a).toBe(10); expect(sink.array[4].b).toEqual(new Date(0));
    expect(sink.array[5].a).toBe(9); expect(sink.array[5].b).toEqual(new Date(1));
    expect(sink.array[6].a).toBe(8); expect(sink.array[6].b).toEqual(new Date(2));
    expect(sink.array[7].a).toBe(7); expect(sink.array[7].b).toEqual(new Date(3));
    expect(sink.array[8].a).toBe(6); expect(sink.array[8].b).toEqual(new Date(4));
    expect(sink.array[9].a).toBe(5); expect(sink.array[9].b).toEqual(new Date(5));
    expect(sink.array[10].a).toBe(4); expect(sink.array[10].b).toEqual(new Date(6));
    expect(sink.array[11].a).toBe(3); expect(sink.array[11].b).toEqual(new Date(7));
    expect(sink.array[12].a).toBe(2); expect(sink.array[12].b).toEqual(new Date(8));
    expect(sink.array[13].a).toBe(1); expect(sink.array[13].b).toEqual(new Date(9));
    expect(sink.array[14].a).toBe(0); expect(sink.array[14].b).toEqual(new Date(10));


  });

  it('merges results (reverse input order)', function() {
    var data = generateData(10);
    var ordering = test.MergePlanTestData.B;

    plan.subPlans = [
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 9; i >= 0; i-- ) {
            sink.put(data.setB[i]);
          }
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 9; i >= 0; i-- ) {
            sink.put(data.setA[i]);
          }
        }
      }),
    ];

    plan.execute([], sink, undefined, undefined, ordering);

    expect(sink.array.length).toBe(15);

    expect(sink.array[0].a).toBe(14); expect(sink.array[0].b).toEqual(new Date(-4));
    expect(sink.array[1].a).toBe(13); expect(sink.array[1].b).toEqual(new Date(-3));
    expect(sink.array[2].a).toBe(12); expect(sink.array[2].b).toEqual(new Date(-2));
    expect(sink.array[3].a).toBe(11); expect(sink.array[3].b).toEqual(new Date(-1));
    expect(sink.array[4].a).toBe(10); expect(sink.array[4].b).toEqual(new Date(0));
    expect(sink.array[5].a).toBe(9); expect(sink.array[5].b).toEqual(new Date(1));
    expect(sink.array[6].a).toBe(8); expect(sink.array[6].b).toEqual(new Date(2));
    expect(sink.array[7].a).toBe(7); expect(sink.array[7].b).toEqual(new Date(3));
    expect(sink.array[8].a).toBe(6); expect(sink.array[8].b).toEqual(new Date(4));
    expect(sink.array[9].a).toBe(5); expect(sink.array[9].b).toEqual(new Date(5));
    expect(sink.array[10].a).toBe(4); expect(sink.array[10].b).toEqual(new Date(6));
    expect(sink.array[11].a).toBe(3); expect(sink.array[11].b).toEqual(new Date(7));
    expect(sink.array[12].a).toBe(2); expect(sink.array[12].b).toEqual(new Date(8));
    expect(sink.array[13].a).toBe(1); expect(sink.array[13].b).toEqual(new Date(9));
    expect(sink.array[14].a).toBe(0); expect(sink.array[14].b).toEqual(new Date(10));

  });

  it('merges with skip and limit', function() {
    var data = generateData(10);
    var ordering = test.MergePlanTestData.B;

    plan.subPlans = [
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 9; i >= 0; i-- ) {
            sink.put(data.setB[i]);
          }
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 9; i >= 0; i-- ) {
            sink.put(data.setA[i]);
          }
        }
      }),
    ];

    plan.execute([], sink, 3, 5, ordering);

    expect(sink.array.length).toBe(5);

    expect(sink.array[0].a).toBe(11); expect(sink.array[0].b).toEqual(new Date(-1));
    expect(sink.array[1].a).toBe(10); expect(sink.array[1].b).toEqual(new Date(0));
    expect(sink.array[2].a).toBe(9); expect(sink.array[2].b).toEqual(new Date(1));
    expect(sink.array[3].a).toBe(8); expect(sink.array[3].b).toEqual(new Date(2));
    expect(sink.array[4].a).toBe(7); expect(sink.array[4].b).toEqual(new Date(3));

  });


  it('handles async indexes', function(done) {
    var data = generateData(10);
    var ordering = test.MergePlanTestData.B;
    var resolve;
    var promiseRef = [new Promise(function(res, rej) {
      resolve = res;
    })];
    var innerResolve;

    plan.subPlans = [
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          promise[0] = Promise.resolve().then(function() {
            for ( var i = 9; i >= 0; i-- ) {
              sink.put(data.setB[i]);
            }
          });
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          promise[0] = new Promise(function(res, rej) {
            innerResolve = res; // intermediate promise we control
          }).then(function() {
            for ( var i = 9; i >= 0; i-- ) { // do final work
              sink.put(data.setA[i]);
            }
          });
        }
      }),
    ];

    plan.execute(promiseRef, sink, undefined, undefined, ordering);
    // Nothing resloved, no sink putting actually done by our customExecutes
    for (var j =0; j<sink.array.length;j++) {
      var item = sink.array[j];
      console.log("item1", j, item.array, item.b);
    }
    expect(sink.array.length).toBe(0);

    promiseRef[0].then(function() {
      // all resolved, all sinks dumped to result sink
      expect(sink.array.length).toBe(15);
    }).then(done);

    // release both the first and second promises in the chain
    resolve();
    innerResolve();
  });


  it('deduplicates when ordered by non-unique values', function() {
    var data = generateDupeData(8);
    var ordering = test.MergePlanTestData.B;

    plan.subPlans = [
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 0; i < 8; i++ ) {
            sink.put(data.setA[i]);
          }
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          for ( var i = 0; i < 8; i++ ) {
            sink.put(data.setA[i].clone());
          }
        }
      }),
    ];

    plan.execute([], sink, undefined, undefined, ordering);

    expect(sink.array.length).toBe(8);

    expect(sink.array[0].a).toBe(0); expect(sink.array[0].b).toEqual(new Date(0));
    expect(sink.array[1].a).toBe(1); expect(sink.array[1].b).toEqual(new Date(0));
    expect(sink.array[2].a).toBe(2); expect(sink.array[2].b).toEqual(new Date(0));
    expect(sink.array[3].a).toBe(3); expect(sink.array[3].b).toEqual(new Date(0));
    expect(sink.array[4].a).toBe(4); expect(sink.array[4].b).toEqual(new Date(1));
    expect(sink.array[5].a).toBe(5); expect(sink.array[5].b).toEqual(new Date(1));
    expect(sink.array[6].a).toBe(6); expect(sink.array[6].b).toEqual(new Date(1));
    expect(sink.array[7].a).toBe(7); expect(sink.array[7].b).toEqual(new Date(1));

  });

  it('deduplicates when not ordered, randomized input order', function() {
    var data = generateDupeData(8);

    plan.subPlans = [
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          sink.put(data.setA[1]);
          sink.put(data.setA[0]);
          sink.put(data.setA[3]);
          sink.put(data.setA[2]);
          sink.put(data.setA[6]);
          sink.put(data.setA[7]);
          sink.put(data.setA[4]);
          sink.put(data.setA[5]);
        }
      }),
      foam.dao.index.CustomPlan.create({
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          sink.put(data.setA[0]);
          sink.put(data.setA[3]);
          sink.put(data.setA[1]);
          sink.put(data.setA[2]);
          sink.put(data.setA[6]);
          sink.put(data.setA[5]);
          sink.put(data.setA[7]);
          sink.put(data.setA[4]);
        }
      }),
    ];

    plan.execute([], sink);

    expect(sink.array.length).toBe(8);

    // The first set of items remains, in the order inserted
    expect(sink.array[0].a).toBe(1);
    expect(sink.array[1].a).toBe(0);
    expect(sink.array[2].a).toBe(3);
    expect(sink.array[3].a).toBe(2);
    expect(sink.array[4].a).toBe(6);
    expect(sink.array[5].a).toBe(7);
    expect(sink.array[6].a).toBe(4);
    expect(sink.array[7].a).toBe(5);
  });


});

describe('AND(*, CONTAINS_IC(ID, *)', function() {
  it('should handle this case', function() {
    foam.CLASS({
      package: 'test',
      name: 'Person',
      properties:
      [
        {class: 'String', name: 'id'},
        {class: 'String', name: 'f'},
        {class: 'String', name: 'l'}
      ]
    });
    var dao = foam.dao.MDAO.create({of: test.Person});
    dao.put(test.Person.create({id: 'JSmith', f: 'James', l: 'Smith'}));
    dao.put(test.Person.create({id: 'ACheeseman', f: 'Alice', l: 'Cheeseman'}));
    dao.put(test.Person.create({id: 'RJamison', f: 'Rebecca', l: 'Jamison'}));
    dao.put(test.Person.create({id: 'XMing', f: 'Xi', l: 'Ming'}));
    var E = foam.mlang.ExpressionsSingleton.create();
    dao.where(E.AND(E.EQ(test.Person.L, 'Jamison'),
                    E.CONTAINS_IC(test.Person.ID, 'm')))
        .select().then(function(arraySink) {
          var array = arraySink.array;
          expect(array.length).toBe(1);
          expect(array[0].id).toBe('RJamison');
          expect(array[0].f).toBe('Rebecca');
          expect(array[0].l).toBe('Jamison');
        });
  });
});
