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
    a = test.CompA.create({id: 4, a:1, b:2});
    a2 = test.CompA.create({id: 6, a:'hello', b:6});
    b = test.CompB.create({id: 8, b:a2});
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
    var idbDAO = test.helpers.RandomDelayDAO.create({ of: model, delays: [ 30, 5, 20, 1, 10, 20, 5, 20 ] });
    return idbDAO.removeAll().then(function() {
      var mDAO = test.helpers.RandomDelayDAO.create({ of: model, delays: [ 5, 20, 1, 10, 20, 5, 20 ] });
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
    return Promise.resolve(foam.dao.SequenceNumberDAO.create({ delegate: mDAO, of: model }));
  });

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'id', 'a' ]
    });

    mDAO = foam.dao.MDAO.create({ of: test.CompA });
    sDAO = foam.dao.SequenceNumberDAO.create({ delegate: mDAO, of: test.CompA });
  });

  it('assigns sequence numbers to objects missing the value', function(done) {
    var a = test.CompA.create({ a: 4 }); // id not set
    sDAO.put(a).then(function() {
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(1);
        expect(sink.a[0].id).toEqual(1);
        a = test.CompA.create({ a: 6 }); // id not set
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
    var a = test.CompA.create({ id: 3, a: 4 });
    sDAO.put(a).then(function() {
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(1);
        expect(sink.a[0].id).toEqual(3);
        a = test.CompA.create({ id: 2, a: 6 });
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
    var a = test.CompA.create({ id: 1, a: 4 });
    sDAO.put(a).then(function() {
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(1);
        expect(sink.a[0].id).toEqual(1);
        a = test.CompA.create({ a: 6 }); // id not set
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

    mDAO.put(test.CompA.create({ id: 568, a: 4 }));
    mDAO.put(test.CompA.create({ id: 45, a: 5 }));

    var a = test.CompA.create({ a: 6 }); // id not set
    sDAO.put(a).then(function() {
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(3);
        expect(sink.a[0].id).toEqual(45);
        expect(sink.a[1].id).toEqual(568);
        expect(sink.a[2].id).toEqual(569);
        a = test.CompA.create({ a: 6 }); // id not set
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
    return Promise.resolve(foam.dao.GUIDDAO.create({ delegate: mDAO, of: model }));
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
    var a = test.CompA.create({ a: 4 }); // id not set
    gDAO.put(a).then(function() {
      return mDAO.select().then(function (sink) {
        expect(sink.a.length).toEqual(1);
        expect(sink.a[0].id.length).toBeGreaterThan(8);
        // id set, not a GUID character for predictable sorting in this test
        a = test.CompA.create({ id: '!!!', a: 6 });
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
    lruManager = foam.dao.LRUDAOManager.create({ dao: mDAO, maxSize: 4 });
  });
  afterEach(function() {
    mDAO = null;
    lruManager = null;
  });

  it('accepts items up to its max size', function(done) {
    // Note that MDAO and LRU do not go async for this test

    mDAO.put(test.CompA.create({ id: 1, a: 'one' }));
    mDAO.put(test.CompA.create({ id: 2, a: 'two' }));
    mDAO.put(test.CompA.create({ id: 3, a: 'three' }));
    mDAO.put(test.CompA.create({ id: 4, a: 'four' }));

    mDAO.select(foam.mlang.sink.Count.create()).then(function(counter) {
      expect(counter.value).toEqual(4);
      done();
    });
  });

  it('clears old items to maintain its max size', function(done) {


    mDAO.put(test.CompA.create({ id: 1, a: 'one' }));
    mDAO.put(test.CompA.create({ id: 2, a: 'two' }));
    mDAO.put(test.CompA.create({ id: 3, a: 'three' }));
    mDAO.put(test.CompA.create({ id: 4, a: 'four' }));
    mDAO.put(test.CompA.create({ id: 5, a: 'five' }));

    // LRU updates the dao slighly asynchronously, so give the notifies a
    // frame to propagate (relevant for browser only, node promises are sync-y
    // enough to get by)
    setTimeout(function() {
      mDAO.select(foam.mlang.sink.Count.create()).then(function(counter) {
        expect(counter.value).toEqual(4);
      }).then(function() {
        mDAO.find(1).then(function() {
          fail("Expected no item 1 to be found");
          done();
        },
        function(err) {
          //expected not to find it
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
    mDAO.put(test.CompA.create({ id: 1, a: 'one' }));
    mDAO.put(test.CompA.create({ id: 2, a: 'two' }));
    mDAO.put(test.CompA.create({ id: 3, a: 'three' }));
    mDAO.put(test.CompA.create({ id: 4, a: 'four' }));
    mDAO.put(test.CompA.create({ id: 5, a: 'five' }));

    // LRU updates the dao slighly asynchronously, so give the notifies a
    // frame to propagate (relevant for browser only, node promises are sync-y
    // enough to get by)
    setTimeout(function() {
      mDAO.select(foam.mlang.sink.Count.create()).then(function(counter) {
        expect(counter.value).toEqual(5);
      });
    }, 100);


    //////// new dao should be managed.
    mDAO2.put(test.CompA.create({ id: 1, a: 'one' }));
    mDAO2.put(test.CompA.create({ id: 2, a: 'two' }));
    mDAO2.put(test.CompA.create({ id: 3, a: 'three' }));
    mDAO2.put(test.CompA.create({ id: 4, a: 'four' }));
    mDAO2.put(test.CompA.create({ id: 5, a: 'five' }));

    // LRU updates the dao slighly asynchronously, so give the notifies a
    // frame to propagate (relevant for browser only, node promises are sync-y
    // enough to get by)
    setTimeout(function() {
      mDAO2.select(foam.mlang.sink.Count.create()).then(function(counter) {
        expect(counter.value).toEqual(4);
      }).then(function() {
        mDAO2.find(1).then(function() {
          fail("Expected no item 1 to be found");
          done();
        },
        function(err) {
          //expected not to find it
          done();
        });

      });
    }, 100);



  });
});

describe('ContextualizingDAO', function() {

  var mDAO;
  var cDAO;

  genericDAOTestBattery(function(model) {
    mDAO = foam.dao.MDAO.create({ of: model });
    return Promise.resolve(foam.dao.ContextualizingDAO.create({ delegate: mDAO, of: model }));
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
      imports: [ 'exp' ],
      properties: [ 'id' ]
    });

    var env = test.Environment.create({ exp: 66 });

    mDAO = foam.dao.MDAO.create({ of: test.ImporterA });
    cDAO = foam.dao.ContextualizingDAO.create({
      delegate: mDAO, of: test.ImporterA
    }, env);
  });

  it('swaps context so find() result objects see ContextualizingDAO context', function(done) {

    var a = test.ImporterA.create({ id: 1 });

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

    remoteDAO = test.helpers.OfflineableDAO.create({ of: test.SyncModel });
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
    setTimeout(fn, 100);
  }

  function preloadRemote() {
    remoteDAO.array = [
      test.SyncModel.create({ id: 0, source: 'server' }),
      test.SyncModel.create({ id: 1, version: 3, source: 'server' }),
      test.SyncModel.create({ id: 2, version: 3, source: 'server' }),
      test.SyncModel.create({ id: 3, source: 'server' }),
      test.SyncModel.create({ id: 4, version: 2, source: 'server' }),
    ];
  }

  function loadSync() {
    syncDAO.put(test.SyncModel.create({ id: 2, source: 'client' }));
    syncDAO.put(test.SyncModel.create({ id: 3, source: 'client' }));
    syncDAO.put(test.SyncModel.create({ id: 4, source: 'client' }));
    syncDAO.put(test.SyncModel.create({ id: 5, source: 'client' }));
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



  // Cases:
  // - 



});
