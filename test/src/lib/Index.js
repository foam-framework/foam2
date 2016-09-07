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
  ].map(function(cfg) {
    return test.Indexable.create(cfg);
  });
}



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




