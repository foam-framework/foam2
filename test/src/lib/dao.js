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

    expect(result.array[0]).toEqual(a);
    expect(result.array[1]).toEqual(a2);
    expect(result.array[2]).toEqual(b);
    expect(result.array[2].stringify()).toEqual(b.stringify());
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

function idbAvailable() {
  if ( ! foam.dao.IDBDAO ) return false;

  if ( global.indexedDB !== undefined
    || global.webkitIndexedDB !== undefined
    || global.mozIndexedDB !== undefined
  ) {
    return true;
  }

  try {
    require('fake-indexeddb/auto');
    return true;
  } catch (e) {
    return false;
  }
}

if ( idbAvailable() ) {
  describe('IDBDAO', function() {
    genericDAOTestBattery(function(model) {
      var dao = foam.dao.IDBDAO.create({ of: model });
      return dao.removeAll().then(function() {
        return Promise.resolve(dao);
      } );
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

xdescribe('LazyCacheDAO-cacheOnSelect', function() {
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

xdescribe('LazyCacheDAO', function() {
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
    var daoType = idbAvailable() ?
        (foam.dao.IDBDAO || foam.dao.LocalStorageDAO) : foam.dao.MDAO;
    var idbDAO = daoType.create({ name: '_test_readCache_', of: model });
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
        expect(sink.array.length).toEqual(1);
        expect(sink.array[0].id).toEqual(1);
        a = test.CompA.create({ a: 6 }, foam.__context__); // id not set
        return sDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            expect(sink.array.length).toEqual(2);
            expect(sink.array[0].id).toEqual(1);
            expect(sink.array[0].a).toEqual(4);
            expect(sink.array[1].id).toEqual(2);
            expect(sink.array[1].a).toEqual(6);
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
        expect(sink.array.length).toEqual(1);
        expect(sink.array[0].id).toEqual(3);
        a = test.CompA.create({ id: 2, a: 6 }, foam.__context__);
        return sDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            expect(sink.array.length).toEqual(2);
            expect(sink.array[0].id).toEqual(2);
            expect(sink.array[0].a).toEqual(6);
            expect(sink.array[1].id).toEqual(3);
            expect(sink.array[1].a).toEqual(4);
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
        expect(sink.array.length).toEqual(3);
        expect(sink.array[0].id).toEqual(45);
        expect(sink.array[1].id).toEqual(568);
        expect(sink.array[2].id).toEqual(569);
        a = test.CompA.create({ a: 6 }, foam.__context__); // id not set
        return sDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            expect(sink.array.length).toEqual(4);
            expect(sink.array[3].id).toEqual(570);
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
        expect(sink.array.length).toEqual(1);
        expect(sink.array[0].id.length).toBeGreaterThan(8);
        // id set, not a GUID character for predictable sorting in this test
        a = test.CompA.create({ id: '!!!', a: 6 }, foam.__context__);
        return gDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            expect(sink.array.length).toEqual(2);
            expect(sink.array[0].id.length).toBeLessThan(8);
            expect(sink.array[1].id.length).toBeGreaterThan(8);
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
        expect(sink.array.length).toEqual(1);
        expect(sink.array[0].exp).toBeUndefined();

        return cDAO.find(1).then(function (obj) {
          expect(obj.exp).toEqual(66); // now has context with env export
          done();
        });

      });
    });
  });
});


// TODO(jacksonic): FOAM2 has a partial port of the components required for a
// correct SyncDAO. The folowing issues have not been resolved:
//
// - Implement VersionNoDAO decorate server's DAO and automatically bump version
//   numbers
//
// - Assert that "versionProperty" is a foam.core.Int. Possibly also assert a
//   default value of 0.
//
// - Well written tests should:
//
//   + Always define version numbers on instances;
//
//   + Use a second client to contrive "stale" version numbers in a realistic
//     multi-client scenario;
//
//   + More comments on why expectation is what it is.
xdescribe('SyncDAO', function() {

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
        expect(sink.array.length).toEqual(5);
        expect(sink.array[2].version).toEqual(3);
      }).then(done);
    });
  });

  it('syncs from remote on first connect', function(done) {
    preloadRemote();
    remoteDAO.offline = false;

    doSyncThen(function() {
      syncDAO.select().then(function(sink) {
        expect(sink.array.length).toEqual(5);
        expect(sink.array[2].version).toEqual(3);
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
        expect(sink.array.length).toEqual(5);

        remoteDAO.offline = true;
        syncDAO.remove(sink.array[1]);
        syncDAO.remove(sink.array[0]); // version is stale, will not remove
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
//         expect(sink.array.length).toEqual(5);
//           console.log("cache1", cacheDAO.array);

//         remoteDAO.remove(sink.array[1]);
//         remoteDAO.offline = true;
//         syncDAO.remove(sink.array[0]);
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

  it('accepts put operations', function(done) {
    var nDAO = foam.dao.NullDAO.create();
    nDAO.put().then(
      function() {
        done();
      },
      function(err) {
        fail('put should not be accepted');
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

    nDAO.select(sink).then(function() {
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
        expect(sink.array.length).toEqual(1);
        expect(sink.array[0].id).toBeGreaterThan(0);
        a = test.CompA.create({ a: 6 }, foam.__context__); // id not set
        jasmine.clock().tick(2000);
        return sDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            jasmine.clock().tick(2000);
            expect(sink.array.length).toEqual(2);
            expect(sink.array[0].id).toBeGreaterThan(0);
            expect(sink.array[0].a).toEqual(4);
            expect(sink.array[1].id).toBeGreaterThan(sink.array[0].id);
            expect(sink.array[1].a).toEqual(6);
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
        expect(sink.array.length).toEqual(1);
        expect(sink.array[0].id).toEqual(3);
        a = test.CompA.create({ id: 2, a: 6 }, foam.__context__);
        jasmine.clock().tick(2000);
        return sDAO.put(a).then(function() {
          return mDAO.select().then(function (sink) {
            jasmine.clock().tick(2000);
            expect(sink.array.length).toEqual(2);
            expect(sink.array[0].id).toEqual(2);
            expect(sink.array[0].a).toEqual(6);
            expect(sink.array[1].id).toEqual(3);
            expect(sink.array[1].a).toEqual(4);
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
// debug.js:264 String               serverUri      http://0.0.0.0:8000/api
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
});


describe('String.daoize', function() {
  it('handles a model name', function() {
    expect(foam.String.daoize('MyModel')).toEqual('myModelDAO');
  });
  it('handles a model name with package', function() {
    expect(foam.String.daoize('test.package.PkgModel')).toEqual('test.package.PkgModelDAO');
  });

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

  it('finds by multipart ID', function(done) {

    mDAO.put(test.Mpid.create({ a: 1, b: 1, c: 1 }, foam.__context__)); // add
    mDAO.put(test.Mpid.create({ a: 1, b: 2, c: 2 }, foam.__context__)); // add
    mDAO.put(test.Mpid.create({ a: 2, b: 1, c: 3 }, foam.__context__)); // add
    mDAO.put(test.Mpid.create({ a: 2, b: 2, c: 4 }, foam.__context__)); // add

    mDAO.find(test.Mpid.create({ a: 2, b: 1 }).id).then(function(obj) { // with array key
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
    sink = foam.dao.DAOSink.create({
      dao: foam.dao.ArrayDAO.create({ of: test.CompA })
    });
    dao = foam.dao.NoSelectAllDAO.create({ of: test.CompA, delegate: srcdao });

    dao.put(test.CompA.create({ id: 0, a: 4 }, foam.__context__));
    dao.put(test.CompA.create({ id: 2, a: 77 }, foam.__context__));
    dao.put(test.CompA.create({ id: 3, a: 8 }, foam.__context__));
    dao.put(test.CompA.create({ id: 4, a: 99 }, foam.__context__));

  });

  it('Does not forward select() with no restrictions', function(done) {
    dao.select(sink).then(function(snk) {
      expect(snk.dao.array.length).toEqual(0);
      done();
    });
  });

  it('Forwards select() with a predicate', function(done) {
    dao.where(m.LT(test.CompA.A, 20)).select(sink).then(function(snk) {
      expect(snk.dao.array.length).toEqual(2);
      done();
    });
  });

  it('Forwards select() with a limit', function(done) {
    dao.limit(2).select(sink).then(function(snk) {
      expect(snk.dao.array.length).toEqual(2);
      done();
    });
  });

  it('Forwards select() with a skip', function(done) {
    dao.skip(1).select(sink).then(function(snk) {
      expect(snk.dao.array.length).toEqual(3);
      done();
    });
  });

  it('Does not forward select() with an infinite limit', function(done) {
    dao.limit(Math.Infinity).select(sink).then(function(snk) {
      expect(snk.dao.array.length).toEqual(0);
      done();
    });
  });



});
