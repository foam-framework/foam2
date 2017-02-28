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

describe('FlowControl', function() {

  it('stops', function() {
    var fc = foam.dao.FlowControl.create();

    fc.stop();
    expect(fc.stopped).toEqual(true);
  });

  it('errors', function() {
    var fc = foam.dao.FlowControl.create();

    fc.error("error");
    expect(fc.errorEvt).toEqual("error");
  });

});

describe('AbstractSink', function() {
  it('covers empty methods', function() {
    var sink = foam.dao.AbstractSink.create();

    sink.put();
    sink.remove();
    sink.eof();
    sink.error();
    sink.reset();
  });
});



describe('PredicatedSink', function() {

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });

    foam.CLASS({
      name: 'TestPredicate',
      implements: [ 'foam.mlang.predicate.Predicate' ],
      properties: [
        'calledWith',
        'allow',
        'f'
      ]
    });
  });

  it('only puts on a match', function() {
    var fakePredicate = TestPredicate.create({
      calledWith: null,
      allow: false,
      f: function(o) { this.calledWith = o; if ( this.allow ) return true; }
    }, foam.__context__);

    var sink = foam.dao.PredicatedSink.create({
      predicate: fakePredicate,
      delegate: foam.dao.ArraySink.create()
    });

    var a = test.CompA.create({ id: 0, a: 3 }, foam.__context__);
    var b = test.CompA.create({ id: 1, a: 5 }, foam.__context__);

    sink.put(a);
    expect(fakePredicate.calledWith).toEqual(a);
    expect(sink.delegate.a.length).toEqual(0);

    fakePredicate.allow = true;
    sink.put(b);
    expect(fakePredicate.calledWith).toEqual(b);
  });

  it('only removes on a match', function() {
    var fakePredicate = TestPredicate.create({
      calledWith: null,
      allow: false,
      f: function(o) { this.calledWith = o; if ( this.allow ) return true; }
    }, foam.__context__);

    var sink = foam.dao.PredicatedSink.create({
      predicate: fakePredicate,
      delegate: foam.dao.ArrayDAO.create()
    });

    var a = test.CompA.create({ id: 0, a: 3 }, foam.__context__);
    var b = test.CompA.create({ id: 1, a: 5 }, foam.__context__);

    fakePredicate.allow = true;
    sink.put(a);
    expect(fakePredicate.calledWith).toEqual(a);
    expect(sink.delegate.array.length).toEqual(1);

    fakePredicate.calledWith = null;
    fakePredicate.allow = false;
    sink.remove(a);
    expect(fakePredicate.calledWith).toEqual(a);
    expect(sink.delegate.array.length).toEqual(1);

    fakePredicate.calledWith = null;
    fakePredicate.allow = true;
    sink.remove(a);
    expect(fakePredicate.calledWith).toEqual(a);
    expect(sink.delegate.array.length).toEqual(0);
  });

});



describe('QuickSink', function() {

  it('calls given functions', function() {
    function mockCallP(o) { this.calledPut = o; }
    function mockCallR(o) { this.calledRemove = o; }
    function mockCallE(o) { this.calledEof = o; }
    function mockCallEr(o) { this.calledError = o; }
    function mockCallRe(o) { this.calledReset = o; }

    var sink = foam.dao.QuickSink.create({
      putFn: mockCallP,
      removeFn: mockCallR,
      eofFn: mockCallE,
      errorFn: mockCallEr,
      resetFn: mockCallRe
    });

    sink.put("putcall");
    sink.remove("removecall");
    sink.eof("eofcall");
    sink.error("errorcall");
    sink.reset("resetcall");

    expect(sink.calledPut).toEqual("putcall");
    expect(sink.calledRemove).toEqual("removecall");
    expect(sink.calledEof).toEqual("eofcall");
    expect(sink.calledError).toEqual("errorcall");
    expect(sink.calledReset).toEqual("resetcall");

  });

});



describe('LimitedSink', function() {

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });
  });

  it('only puts when below limit', function() {
    var sink = foam.dao.LimitedSink.create({
      limit: 3,
      delegate: foam.dao.ArrayDAO.create()
    });

    var a = test.CompA.create({ id: 0, a: 9 }, foam.__context__);
    var b = test.CompA.create({ id: 1, a: 7 }, foam.__context__);
    var c = test.CompA.create({ id: 2, a: 5 }, foam.__context__);
    var d = test.CompA.create({ id: 3, a: 3 }, foam.__context__);

    sink.put(a);
    sink.put(b);
    sink.put(c);
    sink.put(d);

    expect(sink.delegate.array.length).toEqual(3);
    expect(sink.delegate.array[0].id).toEqual(0);
    expect(sink.delegate.array[1].id).toEqual(1);
    expect(sink.delegate.array[2].id).toEqual(2);

  });

  it('only removes when below limit', function() {
    var sink = foam.dao.LimitedSink.create({
      limit: 3,
      delegate: foam.dao.ArrayDAO.create()
    });

    var a = test.CompA.create({ id: 0, a: 9 }, foam.__context__);
    var b = test.CompA.create({ id: 1, a: 7 }, foam.__context__);
    var c = test.CompA.create({ id: 2, a: 5 }, foam.__context__);
    var d = test.CompA.create({ id: 3, a: 3 }, foam.__context__);

    sink.delegate.put(a);
    sink.delegate.put(b);
    sink.delegate.put(c);
    sink.delegate.put(d);

    sink.remove(a);
    sink.remove(b);
    sink.remove(c);
    sink.remove(d);

    expect(sink.delegate.array.length).toEqual(1);
    expect(sink.delegate.array[0].id).toEqual(3);

  });

  it('put stops flow control', function() {
    var sink = foam.dao.LimitedSink.create({
      limit: 3,
      delegate: foam.dao.ArrayDAO.create()
    });
    var fc = foam.dao.FlowControl.create();

    var a = test.CompA.create({ id: 0, a: 9 }, foam.__context__);
    var b = test.CompA.create({ id: 1, a: 7 }, foam.__context__);
    var c = test.CompA.create({ id: 2, a: 5 }, foam.__context__);
    var d = test.CompA.create({ id: 3, a: 3 }, foam.__context__);

    sink.put(a, fc);
    expect(fc.stopped).toEqual(false);
    sink.put(b, fc);
    expect(fc.stopped).toEqual(false);
    sink.put(c, fc);
    expect(fc.stopped).toEqual(false);
    sink.put(d, fc);
    expect(fc.stopped).toEqual(true);
  });

  it('remove stops flow control', function() {
    var sink = foam.dao.LimitedSink.create({
      limit: 3,
      delegate: foam.dao.ArrayDAO.create()
    });
    var fc = foam.dao.FlowControl.create();

    var a = test.CompA.create({ id: 0, a: 9 }, foam.__context__);
    var b = test.CompA.create({ id: 1, a: 7 }, foam.__context__);
    var c = test.CompA.create({ id: 2, a: 5 }, foam.__context__);
    var d = test.CompA.create({ id: 3, a: 3 }, foam.__context__);

    sink.delegate.put(a);
    sink.delegate.put(b);
    sink.delegate.put(c);
    sink.delegate.put(d);

    sink.remove(a, fc);
    expect(fc.stopped).toEqual(false);
    sink.remove(b, fc);
    expect(fc.stopped).toEqual(false);
    sink.remove(c, fc);
    expect(fc.stopped).toEqual(false);
    sink.remove(d, fc);
    expect(fc.stopped).toEqual(true);

  });

});


describe('SkipSink', function() {

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });
  });

  it('only puts when above limit', function() {
    var sink = foam.dao.SkipSink.create({
      skip: 2,
      delegate: foam.dao.ArrayDAO.create()
    });

    var a = test.CompA.create({ id: 0, a: 9 }, foam.__context__);
    var b = test.CompA.create({ id: 1, a: 7 }, foam.__context__);
    var c = test.CompA.create({ id: 2, a: 5 }, foam.__context__);
    var d = test.CompA.create({ id: 3, a: 3 }, foam.__context__);

    sink.put(a);
    sink.put(b);
    sink.put(c);
    sink.put(d);

    expect(sink.delegate.array.length).toEqual(2);
    expect(sink.delegate.array[0].id).toEqual(2);
    expect(sink.delegate.array[1].id).toEqual(3);

  });

  it('only removes when below limit', function() {
    var sink = foam.dao.SkipSink.create({
      skip: 2,
      delegate: foam.dao.ArrayDAO.create()
    });

    var a = test.CompA.create({ id: 0, a: 9 }, foam.__context__);
    var b = test.CompA.create({ id: 1, a: 7 }, foam.__context__);
    var c = test.CompA.create({ id: 2, a: 5 }, foam.__context__);
    var d = test.CompA.create({ id: 3, a: 3 }, foam.__context__);

    sink.delegate.put(a);
    sink.delegate.put(b);
    sink.delegate.put(c);
    sink.delegate.put(d);

    sink.remove(a);
    sink.remove(b);
    sink.remove(c);
    sink.remove(d);

    expect(sink.delegate.array.length).toEqual(2);
    expect(sink.delegate.array[0].id).toEqual(0);
    expect(sink.delegate.array[1].id).toEqual(1);

  });

});



if ( typeof localStorage === "undefined" || localStorage === null ) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./tmp');
}
describe('LocalStorageDAO', function() {
  var a;
  var a2;
  var b;

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a', 'b' ]
    });
    foam.CLASS({
      package: 'test',
      name: 'CompB',
      properties: [ 'id', 'b' ]
    });
    a = test.CompA.create({id: 4, a:1, b:2}, foam.__context__);
    a2 = test.CompA.create({id: 6, a:'hello', b:6}, foam.__context__);
    b = test.CompB.create({id: 8, b:a2}, foam.__context__);
  });
  afterEach(function() {
    a = a2 = b = null;
  });

  it('can be created', function() {
    foam.dao.LocalStorageDAO.create({ name: '_test_LS_' });
  });
  it('reads back written data', function() {
    var dao = foam.dao.LocalStorageDAO.create({ name: '_test_LS_' });

    dao.put(a);
    dao.put(a2);
    dao.put(b);

    // a new local storage dao with the same store name
    // TODO: guarantee file sync so we can test this synchronously
    //var dao2 = foam.dao.LocalStorageDAO.create({ name: '_test_LS_' });
    var dao2 = dao; // still checks deserialization

    var result = foam.dao.ArraySink.create();
    dao2.select(result);

    expect(result.a[0]).toEqual(a);
    expect(result.a[1]).toEqual(a2);
    expect(result.a[2]).toEqual(b);
    expect(result.a[2].stringify()).toEqual(b.stringify());
  });

  // Run the generic suite of DAO tests against it.
  genericDAOTestBattery(function(model) {
    localStorage.removeItem('_test_LS_generic_');
    return Promise.resolve(foam.dao.LocalStorageDAO.create({ name: '_test_LS_generic_', of: model }));
  });

  afterAll(function() {
    localStorage.clear();
  });

  // TODO: test nested objects when foam.json supports them
});


describe('ArrayDAO', function() {
  genericDAOTestBattery(function(model) {
    return Promise.resolve(foam.dao.ArrayDAO.create({ of: model }));
  });
});

if ( foam.dao.IDBDAO ) {
  describe('IDBDAO', function() {
    genericDAOTestBattery(function(model) {
      var dao = foam.dao.IDBDAO.create({ of: model });
      return dao.removeAll().then(function() { return Promise.resolve(dao); } );
    });
  });
}

describe('MDAO', function() {
  genericDAOTestBattery(function(model) {
    return Promise.resolve(foam.dao.MDAO.create({ of: model }));
  });
});

// NOTE: not all generic tests are applicable, as LazyCacheDAO does not
//   offer a way to immediately sync results. It will eagerly deliver
//   partial results and update eventually. Perhaps a different set
//   of genericDAOTestBattery for this kind of partial-result case.
// describe('LazyCacheDAO-cacheOnSelect-async', function() {
//   // test caching against an IDBDAO remote and MDAO cache.
//   genericDAOTestBattery(function(model) {
//     var idbDAO = test.helpers.RandomDelayDAO.create({
//       of: model,
//       delays: [ 5, 20, 1, 10, 20, 5, 20 ]
//     });
//     var mDAO = test.helpers.RandomDelayDAO.create({
//       of: model,
//       delays: [ 5, 20, 1, 10, 20, 5, 20 ]
//     });
//     return Promise.resolve(foam.dao.LazyCacheDAO.create({
//       delegate: idbDAO,
//       cache: mDAO,
//       cacheOnSelect: true
//     }));
//   });
// });

describe('LazyCacheDAO-cacheOnSelect', function() {
  // test caching against an IDBDAO remote and MDAO cache.
  genericDAOTestBattery(function(model) {
    var idbDAO = ( foam.dao.IDBDAO || foam.dao.LocalStorageDAO )
      .create({ name: '_test_lazyCache_', of: model });
    return idbDAO.removeAll().then(function() {
      var mDAO = foam.dao.MDAO.create({ of: model });
      return foam.dao.LazyCacheDAO.create({
        delegate: idbDAO,
        cache: mDAO,
        cacheOnSelect: true
      });
    });
  });
});

describe('LazyCacheDAO', function() {
  // test caching against an IDBDAO remote and MDAO cache.
  genericDAOTestBattery(function(model) {
    var idbDAO = ( foam.dao.IDBDAO || foam.dao.LocalStorageDAO )
      .create({ name: '_test_lazyCache_', of: model });
    return idbDAO.removeAll().then(function() {
      var mDAO = foam.dao.MDAO.create({ of: model });
      return foam.dao.LazyCacheDAO.create({
        delegate: idbDAO,
        cache: mDAO,
        cacheOnSelect: false
      });
    });
  });
});

describe('CachingDAO', function() {
  genericDAOTestBattery(function(model) {
    var idbDAO = ( foam.dao.IDBDAO || foam.dao.LocalStorageDAO )
      .create({ name: '_test_readCache_', of: model });
    return idbDAO.removeAll().then(function() {
      var mDAO = foam.dao.MDAO.create({ of: model });
      return foam.dao.CachingDAO.create({ src: idbDAO, cache: mDAO });
    });
  });
});

describe('CachingDAO-async', function() {
  genericDAOTestBattery(function(model) {
    var idbDAO = test.helpers.RandomDelayDAO.create({
      of: model,
      delays: [ 30, 5, 20, 1, 10, 20, 5, 20 ]
    }, foam.__context__);
    return idbDAO.removeAll().then(function() {
      var mDAO = test.helpers.RandomDelayDAO.create({
        of: model,
        delays: [ 5, 20, 1, 10, 20, 5, 20 ]
      }, foam.__context__);
      return foam.dao.CachingDAO.create({ src: idbDAO, cache: mDAO });
    });
  });
});

describe('DeDupDAO', function() {
  genericDAOTestBattery(function(model) {
    var mDAO = foam.dao.MDAO.create({ of: model });
    return Promise.resolve(foam.dao.DeDupDAO.create({ delegate: mDAO }));
  });
});

describe('SequenceNumberDAO', function() {

  var mDAO;
  var sDAO;

  genericDAOTestBattery(function(model) {
    mDAO = foam.dao.MDAO.create({ of: model });
    return Promise.resolve(foam.dao.SequenceNumberDAO.create({
      delegate: mDAO,
      of: model
    }));
  });

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });

    mDAO = foam.dao.MDAO.create({ of: test.CompA });
    sDAO = foam.dao.SequenceNumberDAO.create({
      delegate: mDAO,
      of: test.CompA
    });
  });

  it('assigns sequence numbers to objects missing the value', function(done) {
    var a = test.CompA.create({ a: 4 }, foam.__context__); // id not set
    sDAO.put(a).then(function() {
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(1);
        expect(sink.a[0].id).toEqual(1);
        a = test.CompA.create({ a: 6 }, foam.__context__); // id not set
        return sDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            expect(sink.a.length).toEqual(2);
            expect(sink.a[0].id).toEqual(1);
            expect(sink.a[0].a).toEqual(4);
            expect(sink.a[1].id).toEqual(2);
            expect(sink.a[1].a).toEqual(6);
            done();
          });
        });
      });
    });
  });

  it('skips sequence numbers to objects with an existing value', function(done) {
    var a = test.CompA.create({ id: 3, a: 4 }, foam.__context__);
    sDAO.put(a).then(function() {
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(1);
        expect(sink.a[0].id).toEqual(3);
        a = test.CompA.create({ id: 2, a: 6 }, foam.__context__);
        return sDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            expect(sink.a.length).toEqual(2);
            expect(sink.a[0].id).toEqual(2);
            expect(sink.a[0].a).toEqual(6);
            expect(sink.a[1].id).toEqual(3);
            expect(sink.a[1].a).toEqual(4);
            done();
          });
        });
      });
    });
  });

  it('does not reuse sequence numbers from objects with an existing value', function(done) {
    var a = test.CompA.create({ id: 1, a: 4 }, foam.__context__);
    sDAO.put(a).then(function() {
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(1);
        expect(sink.a[0].id).toEqual(1);
        a = test.CompA.create({ a: 6 }, foam.__context__); // id not set
        return sDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            expect(sink.a.length).toEqual(2);
            expect(sink.a[0].id).toEqual(1);
            expect(sink.a[0].a).toEqual(4);
            expect(sink.a[1].id).toEqual(2);
            expect(sink.a[1].a).toEqual(6);
            done();
          });
        });
      });
    });
  });

  it('starts from the existing max value', function(done) {

    mDAO.put(test.CompA.create({ id: 568, a: 4 }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 45, a: 5 }, foam.__context__));

    var a = test.CompA.create({ a: 6 }, foam.__context__); // id not set
    sDAO.put(a).then(function() {
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(3);
        expect(sink.a[0].id).toEqual(45);
        expect(sink.a[1].id).toEqual(568);
        expect(sink.a[2].id).toEqual(569);
        a = test.CompA.create({ a: 6 }, foam.__context__); // id not set
        return sDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            expect(sink.a.length).toEqual(4);
            expect(sink.a[3].id).toEqual(570);
            done();
          });
        });
      });
    });
  });
});

describe('GUIDDAO', function() {

  var mDAO;
  var gDAO;

  genericDAOTestBattery(function(model) {
    mDAO = foam.dao.MDAO.create({ of: model });
    return Promise.resolve(foam.dao.GUIDDAO.create({
      delegate: mDAO,
      of: model
    }));
  });

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });

    mDAO = foam.dao.MDAO.create({ of: test.CompA });
    gDAO = foam.dao.GUIDDAO.create({ delegate: mDAO, of: test.CompA });
  });

  it('assigns GUIDs to objects missing the value', function(done) {
    var a = test.CompA.create({ a: 4 }, foam.__context__); // id not set
    gDAO.put(a).then(function() {
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(1);
        expect(sink.a[0].id.length).toBeGreaterThan(8);
        // id set, not a GUID character for predictable sorting in this test
        a = test.CompA.create({ id: '!!!', a: 6 }, foam.__context__);
        return gDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            expect(sink.a.length).toEqual(2);
            expect(sink.a[0].id.length).toBeLessThan(8);
            expect(sink.a[1].id.length).toBeGreaterThan(8);
            done();
          });
        });
      });
    });
  });
});

describe('LRUDAOManager', function() {
  var mDAO;
  var lruManager;

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });

    mDAO = foam.dao.MDAO.create({ of: test.CompA });
    lruManager = foam.dao.LRUDAOManager.create({
      dao: mDAO,
      maxSize: 4
    });
  });
  afterEach(function() {
    mDAO = null;
    lruManager = null;
  });

  it('accepts items up to its max size', function(done) {
    // Note that MDAO and LRU do not go async for this test

    mDAO.put(test.CompA.create({ id: 1, a: 'one' }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 2, a: 'two' }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 3, a: 'three' }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 4, a: 'four' }, foam.__context__));

    mDAO.select(foam.mlang.sink.Count.create())
      .then(function(counter) {
        expect(counter.value).toEqual(4);
        done();
      });
  });

  it('clears old items to maintain its max size', function(done) {


    mDAO.put(test.CompA.create({ id: 1, a: 'one' }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 2, a: 'two' }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 3, a: 'three' }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 4, a: 'four' }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 5, a: 'five' }, foam.__context__));

    // LRU updates the dao slighly asynchronously, so give the notifies a
    // frame to propagate (relevant for browser only, node promises are sync-y
    // enough to get by)
    setTimeout(function() {
      mDAO.select(foam.mlang.sink.Count.create())
        .then(function(counter) {
          expect(counter.value).toEqual(4);
        }).then(function() {
          mDAO.find(1).then(function(obj) {
            expect(obj).toBe(null);
            done();
          });
        });
    }, 100);
  });


  it('handles a dao switch', function(done) {
    // Note that MDAO and LRU do not go async for this test

    // swap dao
    mDAO2 = foam.dao.MDAO.create({ of: test.CompA });
    lruManager.dao = mDAO2;

    // original dao should not be managed
    mDAO.put(test.CompA.create({ id: 1, a: 'one' }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 2, a: 'two' }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 3, a: 'three' }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 4, a: 'four' }, foam.__context__));
    mDAO.put(test.CompA.create({ id: 5, a: 'five' }, foam.__context__));

    // LRU updates the dao slighly asynchronously, so give the notifies a
    // frame to propagate (relevant for browser only, node promises are sync-y
    // enough to get by)
    setTimeout(function() {
      mDAO.select(foam.mlang.sink.Count.create())
        .then(function(counter) {
          expect(counter.value).toEqual(5);
        });
    }, 100);


    //////// new dao should be managed.
    mDAO2.put(test.CompA.create({ id: 1, a: 'one' }, foam.__context__));
    mDAO2.put(test.CompA.create({ id: 2, a: 'two' }, foam.__context__));
    mDAO2.put(test.CompA.create({ id: 3, a: 'three' }, foam.__context__));
    mDAO2.put(test.CompA.create({ id: 4, a: 'four' }, foam.__context__));
    mDAO2.put(test.CompA.create({ id: 5, a: 'five' }, foam.__context__));

    // LRU updates the dao slighly asynchronously, so give the notifies a
    // frame to propagate (relevant for browser only, node promises are sync-y
    // enough to get by)
    setTimeout(function() {
      mDAO2.select(foam.mlang.sink.Count.create())
        .then(function(counter) {
          expect(counter.value).toEqual(4);
        }).then(function() {
          mDAO2.find(1).then(function(obj) {
            expect(obj).toBe(null);
            done();
          });
        });
    }, 100);



  });
});


describe('ArrayDAO', function() {
  var dao;

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });

    dao = foam.dao.ArrayDAO.create({ of: test.CompA });
  });
  afterEach(function() {
    dao = null;
  });

  it('skips properly on removeAll', function(done) {

    dao.put(test.CompA.create({ id: 1, a: 'one' }, foam.__context__));
    dao.put(test.CompA.create({ id: 2, a: 'two' }, foam.__context__));
    dao.put(test.CompA.create({ id: 3, a: 'three' }, foam.__context__));
    dao.put(test.CompA.create({ id: 4, a: 'four' }, foam.__context__));

    dao.skip(2).removeAll().then(function() {
      expect(dao.array.length).toEqual(2);
      expect(dao.array[0].a).toEqual('one');
      expect(dao.array[1].a).toEqual('two');
    }).then(done);
  });


  it('skips and limits properly on removeAll', function(done) {

    dao.put(test.CompA.create({ id: 1, a: 'one' }, foam.__context__));
    dao.put(test.CompA.create({ id: 2, a: 'two' }, foam.__context__));
    dao.put(test.CompA.create({ id: 3, a: 'three' }, foam.__context__));
    dao.put(test.CompA.create({ id: 4, a: 'four' }, foam.__context__));

    dao.skip(1).limit(2).removeAll().then(function() {
      expect(dao.array.length).toEqual(2);
      expect(dao.array[0].a).toEqual('one');
      expect(dao.array[1].a).toEqual('four');
    }).then(done);
  });

  it('skips and limits with predicate properly on removeAll', function(done) {

    dao.put(test.CompA.create({ id: 1, a: 'one' }, foam.__context__));
    dao.put(test.CompA.create({ id: 2, a: 'two' }, foam.__context__));
    dao.put(test.CompA.create({ id: 3, a: 'three' }, foam.__context__));
    dao.put(test.CompA.create({ id: 4, a: 'four' }, foam.__context__));

    dao.skip(1).limit(2).where(
      foam.mlang.predicate.Gt.create({ arg1: test.CompA.ID, arg2: 1 })
    ).removeAll().then(function() {
      expect(dao.array.length).toEqual(2);
      expect(dao.array[0].a).toEqual('one');
      expect(dao.array[1].a).toEqual('two');
    }).then(done);
  });
});

describe('ContextualizingDAO', function() {

  var mDAO;
  var cDAO;

  genericDAOTestBattery(function(model) {
    mDAO = foam.dao.MDAO.create({ of: model });
    return Promise.resolve(foam.dao.ContextualizingDAO.create({
      delegate: mDAO,
      of: model
    }));
  });

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'Environment',
      exports: [ 'exp' ],
      properties: [ 'exp' ]
    });
    foam.CLASS({
      package: 'test',
      name: 'ImporterA',
      imports: [ 'exp?' ],
      properties: [ 'id' ]
    });

    var env = test.Environment.create({ exp: 66 }, foam.__context__);

    mDAO = foam.dao.MDAO.create({ of: test.ImporterA });
    cDAO = foam.dao.ContextualizingDAO.create({
      delegate: mDAO, of: test.ImporterA
    }, env);
  });

  it('swaps context so find() result objects see ContextualizingDAO context', function(done) {

    var a = test.ImporterA.create({ id: 1 }, foam.__context__);

    expect(a.exp).toBeUndefined();

    cDAO.put(a).then(function() {
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(1);
        expect(sink.a[0].exp).toBeUndefined();

        return cDAO.find(1).then(function (obj) {
          expect(obj.exp).toEqual(66); // now has context with env export
          done();
        });

      });
    });
  });
});


describe('SyncDAO', function() {

  // NOTE: Test assumes polling can be simulated by calling SyncDAO.sync()

  var remoteDAO;
  var cacheDAO;
  var syncDAO;
  var syncRecordDAO;

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'SyncModel',
      properties: [ 'id', 'version', 'source' ]
    });

    remoteDAO = test.helpers.OfflineableDAO.create({ of: test.SyncModel }, foam.__context__);
    cacheDAO = foam.dao.ArrayDAO.create({ of: test.SyncModel });
    syncRecordDAO = foam.dao.ArrayDAO.create({ of: foam.dao.SyncRecord });

    syncDAO = foam.dao.SyncDAO.create({
      of: test.SyncModel,
      syncProperty: test.SyncModel.VERSION,
      remoteDAO: remoteDAO,
      delegate: cacheDAO,
      syncRecordDAO: syncRecordDAO,
      polling: false, // Polling simulated by invasive calls to sync()
    });
  });

  // isolate sync/timeout call code, as it may change with SyncDAO's implementation
  function doSyncThen(fn) {
    syncDAO.sync();
    // let promises settle
    setTimeout(fn, 250);
  }

  function preloadRemote() {
    remoteDAO.array = [
      test.SyncModel.create({ id: 0, source: 'server' }, foam.__context__),
      test.SyncModel.create({ id: 1, version: 3, source: 'server' }, foam.__context__),
      test.SyncModel.create({ id: 2, version: 3, source: 'server' }, foam.__context__),
      test.SyncModel.create({ id: 3, source: 'server' }, foam.__context__),
      test.SyncModel.create({ id: 4, version: 2, source: 'server' }, foam.__context__),
    ];
  }

  function loadSync() {
    syncDAO.put(test.SyncModel.create({ id: 2, source: 'client' }, foam.__context__));
    syncDAO.put(test.SyncModel.create({ id: 3, source: 'client' }, foam.__context__));
    syncDAO.put(test.SyncModel.create({ id: 4, source: 'client' }, foam.__context__));
    syncDAO.put(test.SyncModel.create({ id: 5, source: 'client' }, foam.__context__));
  }

  it('syncs from remote on first connect', function(done) {

    preloadRemote();
    remoteDAO.offline = false;

    doSyncThen(function() {
      syncDAO.select().then(function(sink) {
        expect(sink.a.length).toEqual(5);
        expect(sink.a[2].version).toEqual(3);
      }).then(done);
    });
  });

  it('syncs from remote on first connect', function(done) {
    preloadRemote();
    remoteDAO.offline = false;

    doSyncThen(function() {
      syncDAO.select().then(function(sink) {
        expect(sink.a.length).toEqual(5);
        expect(sink.a[2].version).toEqual(3);
      }).then(done);
    });
  });

  it('starts offline, items put to client, then online, syncs to remote', function(done) {
    remoteDAO.offline = true;
    loadSync();

    remoteDAO.offline = false;
    doSyncThen(function() {
      expect(remoteDAO.array.length).toEqual(4);
      done();
    });
  });

  it('starts offline, items put to client, items inserted into remote, then online, syncs both ways', function(done) {
    remoteDAO.offline = true;
    preloadRemote();
    loadSync();

    remoteDAO.offline = false;
    doSyncThen(function() {
      expect(remoteDAO.array.length).toEqual(6);
      expect(cacheDAO.array.length).toEqual(6);
      done();
    });
  });

  it('syncs removes from client, to server', function(done) {

    preloadRemote();
    remoteDAO.offline = false;

    doSyncThen(function() {
      syncDAO.select().then(function(sink) {
        expect(sink.a.length).toEqual(5);

        remoteDAO.offline = true;
        syncDAO.remove(sink.a[1]);
        syncDAO.remove(sink.a[0]); // version is stale, will not remove
        remoteDAO.offline = false;

        doSyncThen(function() {
          expect(remoteDAO.array.length).toEqual(4);
          done();
        });
      })
    });
  });


// TODO: is there a server removal path intended?
// it('syncs removes from client and server', function(done) {

//     preloadRemote();
//     remoteDAO.offline = false;

//     doSyncThen(function() {
//       syncDAO.select().then(function(sink) {
//         expect(sink.a.length).toEqual(5);
//           console.log("cache1", cacheDAO.array);

//         remoteDAO.remove(sink.a[1]);
//         remoteDAO.offline = true;
//         syncDAO.remove(sink.a[0]);
//         remoteDAO.offline = false;
//         doSyncThen(function() {
//           expect(remoteDAO.array.length).toEqual(3);
//           expect(cacheDAO.array.length).toEqual(3);
//           console.log("remote2", remoteDAO.array);
//           console.log("cache2", cacheDAO.array);
//           console.log("sync2", syncRecordDAO.array);
//           done();
//         });
//       })
//     });
//   });

});


describe('JournalDAO', function() {

  var delegateDAO;
  var journalDAO;
  var dao;

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'JournalModel',
      properties: [ 'id', 'value' ]
    });

    journalDAO = foam.dao.ArrayDAO.create({ of: foam.dao.JournalEntry });
    delegateDAO = foam.dao.ArrayDAO.create({ of: test.JournalModel });
    dao = foam.dao.JournalDAO.create({
      of: test.JournalModel,
      delegate: delegateDAO,
      journal: foam.dao.SequenceNumberDAO.create({
          of: foam.dao.JournalEntry,
          delegate: journalDAO
      })
    });

  });

  function loadItems1() {
    return Promise.all([
      dao.put(test.JournalModel.create({ id: 0, value: 1 }, foam.__context__)),
      dao.put(test.JournalModel.create({ id: 1, value: 'one' }, foam.__context__)),
      dao.put(test.JournalModel.create({ id: 2, value: 'a' }, foam.__context__))
    ]);
  }
  function removeItems2() {
    return dao.remove(test.JournalModel.create({ id: 1, value: 'two' }, foam.__context__));
  }
  function loadItems3() {
    return Promise.all([
      dao.put(test.JournalModel.create({ id: 0, value: 3 }, foam.__context__)),
      dao.put(test.JournalModel.create({ id: 2, value: 'c' }, foam.__context__))
    ]);
  }

  it('records write operations', function(done) {
    loadItems1().then(function() {
      expect(journalDAO.array.length).toEqual(3);

      removeItems2().then(function() {
        expect(journalDAO.array.length).toEqual(4);

        loadItems3().then(function() {
          expect(journalDAO.array.length).toEqual(6);
          done();
        });
      });
    });
  });


  it('records enough to rebuild the delegate DAO', function(done) {
    Promise.all([
      loadItems1(),
      removeItems2(),
      loadItems3()
    ]).then(function() {
      // rebuild from the journal
      // select() to ensure the ordering is what the journal thinks is correct
      journalDAO.select().then(function(sink) {
        var newDAO = foam.dao.ArrayDAO.create({ of: test.JournalModel });
        var journal = sink.a;
        for ( var i = 0; i < journal.length; i++ ) {
          var entry = journal[i];
          if ( entry.isRemove )
            newDAO.remove(entry.record);
          else
            newDAO.put(entry.record);
        }

        // compare newDAO and delegateDAO
        expect(delegateDAO.array.length).toEqual(newDAO.array.length);
        for ( var i = 0; i < delegateDAO.array.length; i++ ) {
          if ( delegateDAO.array[i].compareTo(newDAO.array[i]) !== 0 ) {
            fail('mismatched results');
          }
        }
        done();
      });
    });
  });
});

describe('TimingDAO', function() {

  genericDAOTestBattery(function(model) {
    mDAO = foam.dao.MDAO.create({ of: model });
    return Promise.resolve(foam.dao.TimingDAO.create({
      delegate: mDAO,
      of: model,
      name: 'timingtest',
    }));
  });

});


describe('LoggingDAO', function() {

  genericDAOTestBattery(function(model) {
    mDAO = foam.dao.MDAO.create({ of: model });
    return Promise.resolve(foam.dao.LoggingDAO.create({
      delegate: mDAO,
      of: model,
      logger: function() { },
      name: 'loggingtest',
      logReads: true
    }));
  });

});


describe('NullDAO', function() {

  it('rejects put operations', function(done) {
    var nDAO = foam.dao.NullDAO.create();
    nDAO.put().then(
      function() {
        fail('put should not be accepted');
      },
      function(err) {
        done();
      }
    );
  });
  it('find resolves null', function(done) {
    var nDAO = foam.dao.NullDAO.create();
    nDAO.find(4).then(
      function(obj) {
        expect(obj).toBe(null);
        done();
      });
  });
  it('selects as empty', function(done) {
    var sink = {
      eof: function() { this.eofCalled++ },
      eofCalled: 0,
      put: function(o) { this.putCalled++ },
      putCalled: 0,
    };

    var nDAO = foam.dao.NullDAO.create();

    nDAO.select(sink).then(function(sink) {
      expect(sink.eofCalled).toEqual(1);
      expect(sink.putCalled).toEqual(0);
      done();
    });
  });

  it('accepts remove as no-op', function(done) {
    var nDAO = foam.dao.NullDAO.create();
    nDAO.remove().then(done);
  });

  it('accepts removeAll as no-op', function(done) {
    var nDAO = foam.dao.NullDAO.create();
    nDAO.removeAll().then(done);
  });



});

describe('TimestampDAO', function() {

  var mDAO;
  var sDAO;

  genericDAOTestBattery(function(model) {
    mDAO = foam.dao.MDAO.create({ of: model });
    return Promise.resolve(foam.dao.SequenceNumberDAO.create({ delegate: mDAO, of: model }));
  });

  beforeEach(function() {
    jasmine.clock().install();

    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });

    mDAO = foam.dao.MDAO.create({ of: test.CompA });
    sDAO = foam.dao.TimestampDAO.create({ delegate: mDAO, of: test.CompA });
  });

  afterEach(function() {
   jasmine.clock().uninstall();
  });

  it('assigns timestamps to objects missing the value', function(done) {
    jasmine.clock().mockDate(new Date(0));
    jasmine.clock().tick(2000);
    var a = test.CompA.create({ a: 4 }, foam.__context__); // id not set
    sDAO.put(a).then(function() {
      jasmine.clock().tick(2000);
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(1);
        expect(sink.a[0].id).toBeGreaterThan(0);
        a = test.CompA.create({ a: 6 }, foam.__context__); // id not set
        jasmine.clock().tick(2000);
        return sDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            jasmine.clock().tick(2000);
            expect(sink.a.length).toEqual(2);
            expect(sink.a[0].id).toBeGreaterThan(0);
            expect(sink.a[0].a).toEqual(4);
            expect(sink.a[1].id).toBeGreaterThan(sink.a[0].id);
            expect(sink.a[1].a).toEqual(6);
            done();
          });
        });
      });
    });
  });

  it('skips assigning to objects with an existing value', function(done) {
    jasmine.clock().mockDate(new Date(0));
    jasmine.clock().tick(2000);
    var a = test.CompA.create({ id: 3, a: 4 }, foam.__context__);
    sDAO.put(a).then(function() {
      jasmine.clock().tick(2000);
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(1);
        expect(sink.a[0].id).toEqual(3);
        a = test.CompA.create({ id: 2, a: 6 }, foam.__context__);
        jasmine.clock().tick(2000);
        return sDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            jasmine.clock().tick(2000);
            expect(sink.a.length).toEqual(2);
            expect(sink.a[0].id).toEqual(2);
            expect(sink.a[0].a).toEqual(6);
            expect(sink.a[1].id).toEqual(3);
            expect(sink.a[1].a).toEqual(4);
            done();
          });
        });
      });
    });
  });

});

describe('EasyDAO-permutations', function() {

  [
    {
      daoType: 'MDAO',
    },
    {
      daoType: 'LOCAL',
    },
    {
      daoType: 'MDAO',
      seqNo: true,
      seqProperty: 'id'
    },
    {
      daoType: 'LOCAL',
      guid: true,
      seqProperty: 'id'
    },
    {
      daoType: 'MDAO',
      logging: true,
      timing: true,
      journal: true,
      dedup: true,
      contextualize: true
    },
    {
      daoType: 'MDAO',
      cache: true,
    },
// TODO: fix cache issues:
//     {
//       daoType: foam.dao.ArrayDAO,
//       cache: true,
//     },
//     {
//       daoType: 'LOCAL',
//       cache: true,
//     },


// Property             name           foam.core.Property
// debug.js:264 Boolean              seqNo          false
// debug.js:264 Boolean              guid           false
// debug.js:264 Property             seqProperty    undefined
// debug.js:264 Boolean              cache          false
// debug.js:264 Boolean              dedup          false
// debug.js:264 Property             journal        false
// debug.js:264 Boolean              contextualize  false
// debug.js:264 Property             daoType        foam.dao.IDBDAO
// debug.js:264 Boolean              autoIndex      false
// debug.js:264 Boolean              syncWithServer false
// debug.js:264 Boolean              syncPolling    true
// debug.js:264 String               serverUri      http://localhost:8000/api
// debug.js:264 Boolean              isServer       false
// debug.js:264 Property             syncProperty   undefined
// debug.js:264 Class2               of             PropertyClass
  ].forEach(function(cfg) {
    genericDAOTestBattery(function(model) {
      cfg.of = model;
      var dao = foam.dao.EasyDAO.create(cfg);
      return dao.removeAll().then(function() { return dao; });
    });
  });

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });
  });

  it('throws on seqNo && guid', function() {
    expect(function() {
      foam.dao.EasyDAO.create({
        of: test.CompA,
        daoType: 'MDAO',
        seqNo: true,
        guid: true,
      });
    }).toThrow();
  });

  it('forwards addPropertyIndex', function() {
    var dao = foam.dao.EasyDAO.create({
      of: test.CompA,
      daoType: foam.dao.MDAO
    });
    // TODO: mock MDAO, check that these get called through
    dao.addPropertyIndex(test.CompA.A);
    dao.addIndex(test.CompA.A.toIndex(dao.mdao.idIndex));
  });

  it('constructs HTTP ClientDAO', function() {

    foam.CLASS({
      package: 'test',
      name: 'HTTPBoxMocker',
      exports: [
        'httpResponse'
      ],
      properties: [
        'httpResponse'
      ]
    });

    var env = test.HTTPBoxMocker.create(undefined, foam.__context__);
    // TODO: dependency injection reistering is a bit awkward:
    env.__subContext__.register(test.helpers.MockHTTPBox, 'foam.box.HTTPBox');

    var dao = foam.dao.EasyDAO.create({
      of: test.CompA,
      daoType: 'MDAO',
      syncWithServer: true,
      serverUri: 'localhost:8888',
      syncPolling: true,
      syncProperty: test.CompA.A
    }, env);
  });
});


describe('DAO.listen', function() {

  var dao;
  var sink;

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });

    dao  = foam.dao.ArrayDAO.create({ of: test.CompA });
    sink = foam.dao.ArrayDAO.create({ of: test.CompA });
  });

  it('forwards puts', function() {
    var a = test.CompA.create({ id: 0, a: 4 }, foam.__context__);
    var b = test.CompA.create({ id: 4, a: 8 }, foam.__context__);

    dao.listen(sink);
    dao.put(a);

    expect(sink.array.length).toEqual(1);
    expect(sink.array[0]).toEqual(a);

    dao.put(b);
    expect(sink.array.length).toEqual(2);
    expect(sink.array[1]).toEqual(b);
  });

  it('forwards removes', function() {
    var a = test.CompA.create({ id: 0, a: 4 }, foam.__context__);
    var b = test.CompA.create({ id: 4, a: 8 }, foam.__context__);

    sink.put(a);
    sink.put(b);

    dao.put(a);
    dao.put(b);

    dao.listen(sink);
    dao.remove(a);

    expect(sink.array.length).toEqual(1);
    expect(sink.array[0]).toEqual(b);

  });

  it('covers reset', function() {
    dao.listen(sink);
    dao.pub('on', 'reset');

  });

  it('filters puts with predicate', function() {
    var a = test.CompA.create({ id: 0, a: 4 }, foam.__context__);
    var b = test.CompA.create({ id: 4, a: 8 }, foam.__context__);
    var pred = foam.mlang.predicate.Eq.create({ arg1: test.CompA.A, arg2: 4 });

    dao.where(pred).listen(sink);
    dao.put(a);

    expect(sink.array.length).toEqual(1);
    expect(sink.array[0]).toEqual(a);

    dao.put(b);
    expect(sink.array.length).toEqual(1);
    expect(sink.array[0]).toEqual(a);
  });

  it('terminates on flow control stop', function() {
    var a = test.CompA.create({ id: 0, a: 8 }, foam.__context__);
    var b = test.CompA.create({ id: 1, a: 6 }, foam.__context__);
    var c = test.CompA.create({ id: 2, a: 4 }, foam.__context__);
    var d = test.CompA.create({ id: 3, a: 2 }, foam.__context__);

    var obj;
    var fcSink = foam.dao.QuickSink.create({
      putFn: function(o, fc) {
        obj = o;
        fc.stop();
      }
    });

    dao.listen(fcSink);

    dao.put(a);
    expect(obj).toEqual(a);

    dao.put(b);
    expect(obj).toEqual(a);

  });
  it('terminates on flow control error', function() {
    var a = test.CompA.create({ id: 0, a: 8 }, foam.__context__);
    var b = test.CompA.create({ id: 1, a: 6 }, foam.__context__);
    var c = test.CompA.create({ id: 2, a: 4 }, foam.__context__);
    var d = test.CompA.create({ id: 3, a: 2 }, foam.__context__);

    var obj;
    var fcSink = foam.dao.QuickSink.create({
      putFn: function(o, fc) {
        obj = o;
        fc.error("err!");
      }
    });

    dao.listen(fcSink);

    dao.put(a);
    expect(obj).toEqual(a);

    dao.put(b);
    expect(obj).toEqual(a);

  });

  it('and pipe() listens', function(done) {
    var a = test.CompA.create({ id: 0, a: 8 }, foam.__context__);
    var b = test.CompA.create({ id: 1, a: 6 }, foam.__context__);
    var c = test.CompA.create({ id: 2, a: 4 }, foam.__context__);
    var d = test.CompA.create({ id: 3, a: 2 }, foam.__context__);

    dao.put(a);
    dao.put(b);

    dao.pipe(sink).then(function(sub) {
      expect(sink.array.length).toEqual(2);
      expect(sink.array[0]).toEqual(a);
      expect(sink.array[1]).toEqual(b);

      // and we should be listening, too
      dao.put(c);
      expect(sink.array.length).toEqual(3);
      expect(sink.array[2]).toEqual(c);

      // subscription allows disconnect
      sub.detach();
      dao.put(d); // no longer listening
      expect(sink.array.length).toEqual(3);

      done();
    });

  });


});



describe('FilteredDAO', function() {

  var dao;
  var sink;
  var m;
  var l, l2;

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });
    m = foam.mlang.ExpressionsSingleton.create();
    dao  = foam.dao.ArrayDAO.create({ of: test.CompA });
    sink = foam.dao.ArrayDAO.create({ of: test.CompA });
    l = function(s, on, evt, obj) {
      l.evt = evt;
      l.obj = obj;
      l.count = ( l.count + 1 ) || 1;
    };
    l2 = function(s, on, evt, obj) {
      l2.evt = evt;
      l2.obj = obj;
      l2.count = ( l2.count + 1 ) || 1;
    }
  });

  it('filters put events', function() {
    var a = test.CompA.create({ id: 0, a: 4 }, foam.__context__);
    var b = test.CompA.create({ id: 4, a: 8 }, foam.__context__);

    dao = dao.where(m.EQ(test.CompA.A, 4));
    dao.on.sub(l);
    dao.on.sub(l2);

    dao.put(a);
    expect(l.evt).toEqual('put');
    expect(l.obj).toEqual(a);
    expect(l.count).toEqual(1);

    // since 'b' is filtered out, the put changes to remove to ensure the
    // listener knows it shouldn't exist
    dao.put(b);
    expect(l.evt).toEqual('remove');
    expect(l.obj).toEqual(b);
    expect(l.count).toEqual(2);


  });

  it('does not filter remove events', function() {
    var a = test.CompA.create({ id: 0, a: 4 }, foam.__context__);
    var b = test.CompA.create({ id: 4, a: 8 }, foam.__context__);

    dao.put(a);
    dao.put(b);

    dao = dao.where(m.EQ(test.CompA.A, 4));
    dao.on.sub(l);

    dao.remove(a);
    expect(l.evt).toEqual('remove');
    expect(l.obj).toEqual(a);

    dao.remove(b);
    expect(l.evt).toEqual('remove');
    expect(l.obj).toEqual(b);
  });

  it('handles a delegate swap', function() {
    var a = test.CompA.create({ id: 0, a: 4 }, foam.__context__);
    var b = test.CompA.create({ id: 4, a: 8 }, foam.__context__);

    dao = dao.where(m.EQ(test.CompA.A, 4));
    dao.on.sub(l);

    // normal put test
    dao.put(a);
    expect(l.evt).toEqual('put');
    expect(l.obj).toEqual(a);

    dao.put(b);
    expect(l.evt).toEqual('remove');
    expect(l.obj).toEqual(b);

    // swap a new base dao in
    delete l.evt;
    delete l.obj;
    var newBaseDAO = foam.dao.ArrayDAO.create({ of: test.CompA });
    var oldDAO = dao.delegate;
    dao.delegate = newBaseDAO;
    expect(l.evt).toEqual('reset');

    // filtered put from new base
    newBaseDAO.put(b);
    expect(l.evt).toEqual('remove');
    expect(l.obj).toEqual(b);
    delete l.evt;
    delete l.obj;

    // old dao does not cause updates
    oldDAO.put(a);
    expect(l.evt).toBeUndefined();
    expect(l.obj).toBeUndefined();

    // cover destructor
    dao.detach();
  });
});


describe('String.daoize', function() {
  it('handles a model name', function() {
    expect(foam.String.daoize('MyModel')).toEqual('myModelDAO');
  });
  it('handles a model name with package', function() {
    expect(foam.String.daoize('test.package.PkgModel')).toEqual('test.package.PkgModelDAO');
  });

});

describe('Relationship', function() {

  foam.CLASS({
    package: 'test',
    name: 'RelA',
    properties: [
      'bRef'
    ]
  });
  foam.CLASS({
    package: 'test',
    name: 'RelB',
    properties: [
      'aRef'
    ]
  });

  foam.CLASS({
    package: 'test',
    name: 'relEnv',
    exports: [
      'test_RelADAO',
      'test_RelBDAO'
    ],
    properties: [
      {
        name: 'test.RelADAO',
        factory: function() {
          return foam.dao.ArrayDAO.create();
        }
      },
      {
        name: 'test.RelBDAO',
        factory: function() {
          return foam.dao.ArrayDAO.create();
        }
      }

    ]
  });

  foam.RELATIONSHIP({
    forwardName: 'children',
    inverseName: 'parent',
    sourceModel: 'test.RelA',
    //sourceProperties: [ 'bRef' ],
    targetModel: 'test.RelB',
    //targetProperties: [ 'aRef' ],

  });

  it('has relationship DAOs', function() {
    var env = test.relEnv.create(undefined, foam.__context__);
    var relObjA = test.RelA.create(undefined, env);

    var relDAO = relObjA.children;



  })

});


describe('MultiPartID MDAO support', function() {
  var mDAO;

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'Mpid',
      ids: [ 'a', 'b' ],
      properties: [ 'a', 'b', 'c' ]
    });

    mDAO = foam.dao.MDAO.create({ of: test.Mpid });
  });

  afterEach(function() {
    mDAO = null;
  });

  it('generates a proper ID index', function(done) {

    mDAO.put(test.Mpid.create({ a: 1, b: 1, c: 1 }, foam.__context__)); // add
    mDAO.put(test.Mpid.create({ a: 1, b: 2, c: 1 }, foam.__context__)); // add
    mDAO.put(test.Mpid.create({ a: 1, b: 1, c: 2 }, foam.__context__)); // update
    mDAO.put(test.Mpid.create({ a: 1, b: 2, c: 2 }, foam.__context__)); // update
    mDAO.put(test.Mpid.create({ a: 2, b: 1, c: 1 }, foam.__context__)); // add
    mDAO.put(test.Mpid.create({ a: 2, b: 2, c: 1 }, foam.__context__)); // add
    mDAO.put(test.Mpid.create({ a: 2, b: 2, c: 2 }, foam.__context__)); // update

    mDAO.select(foam.mlang.sink.Count.create()).then(function(counter) {
      expect(counter.value).toEqual(4);
      done();
    });
  });

  it('finds by multipart ID array', function(done) {

    mDAO.put(test.Mpid.create({ a: 1, b: 1, c: 1 }, foam.__context__)); // add
    mDAO.put(test.Mpid.create({ a: 1, b: 2, c: 2 }, foam.__context__)); // add
    mDAO.put(test.Mpid.create({ a: 2, b: 1, c: 3 }, foam.__context__)); // add
    mDAO.put(test.Mpid.create({ a: 2, b: 2, c: 4 }, foam.__context__)); // add

    mDAO.find([ 2, 1 ]).then(function(obj) { // with array key
      expect(obj.c).toEqual(3);

      mDAO.find(test.Mpid.create({ a: 2, b: 2 }, foam.__context__).id) // array from MultiPartID
        .then(function(obj2) {
          expect(obj2.c).toEqual(4);
          done();
        });
    });
  });

});


describe('NoSelectAllDAO', function() {

  var dao;
  var srcdao;
  var sink;
  var m;

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });
    m = foam.mlang.ExpressionsSingleton.create();
    srcdao  = foam.dao.ArrayDAO.create({ of: test.CompA });
    sink = foam.dao.ArrayDAO.create({ of: test.CompA });
    dao = foam.dao.NoSelectAllDAO.create({ of: test.CompA, delegate: srcdao });

    dao.put(test.CompA.create({ id: 0, a: 4 }, foam.__context__));
    dao.put(test.CompA.create({ id: 2, a: 77 }, foam.__context__));
    dao.put(test.CompA.create({ id: 3, a: 8 }, foam.__context__));
    dao.put(test.CompA.create({ id: 4, a: 99 }, foam.__context__));

  });

  it('Does not forward select() with no restrictions', function(done) {
    dao.select(sink).then(function(snk) {
      expect(snk.array.length).toEqual(0);
      done();
    });
  });

  it('Forwards select() with a predicate', function(done) {
    dao.where(m.LT(test.CompA.A, 20)).select(sink).then(function(snk) {
      expect(snk.array.length).toEqual(2);
      done();
    });
  });

  it('Forwards select() with a limit', function(done) {
    dao.limit(2).select(sink).then(function(snk) {
      expect(snk.array.length).toEqual(2);
      done();
    });
  });

  it('Forwards select() with a skip', function(done) {
    dao.skip(1).select(sink).then(function(snk) {
      expect(snk.array.length).toEqual(3);
      done();
    });
  });

  it('Does not forward select() with an infinite limit', function(done) {
    dao.limit(Math.Infinity).select(sink).then(function(snk) {
      expect(snk.array.length).toEqual(0);
      done();
    });
  });



});
