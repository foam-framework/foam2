/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KM.IND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
jasmine.DEFAULT_TIMEOUT_INTERVAL = 240000;
if ( ! typeof performance !== 'undefined' ) performance = {
  now: function() { return Date.now(); }
};

describe("MDAO benchmarks", function() {
  it("runs", function(done) {
//done();
//return;
    var NUM_ALBUMS = 1000;
    var NUM_PHOTOS = 10000;

    var DEBUG = false;

//     if ( DEBUG ) {
//       NUM_ALBUMS = 5;
//       NUM_PHOTOS = 25;
//       Function.prototype.put = function() {
//         console.log.apply(console, arguments);
//         this.apply(this, arguments);
//       };
//     }

    function randomBoolean() { return Math.random() > 0.5; }

    function randomDate() { return new Date(Date.now() - Math.random()*1000*60*60*24*365*3); }

    function randomAlbum(i) {
      return Album.create({
        id: i.toString(),
        timestamp: randomDate(),
        isLocal: randomBoolean()
      });
    }

    function randomPhoto(albumId, i) {
      return Photo.create({
         id:      i.toString(),
         albumId: albumId.toString(),
         hash:    Math.floor(Math.random()*10000),
         timestamp: randomDate(),
         isLocal: randomBoolean()
       });
    }

    function atime(name, promise) {
      var startTime = performance.now();
      if ( ! promise.then ) {
        promise = promise();
      }
      var fn = function(arg) {
        var endTime = performance.now();
        console.log(name, ", ", endTime - startTime);
        return arg;
      };
      return promise.then(fn);
    }

    function atest(name, promise) {
      return function() {
        if ( DEBUG ) console.log("Starting:", name);
        return atime(name, promise).then(function(arg) {
          if ( DEBUG ) console.log(name, 'result: ', arg);
        });
      }
    }

    function aseq(/*arguments*/) {
      var s = Array.prototype.slice.call(arguments);
      return function() {
        if ( ! s.length ) return Promise.resolve();

        var p = Promise.resolve();
        for ( var i = 0; i < s.length; ++i ) {
          p = p.then(s[i]);
        }
        return p;
      }
    }

    function arepeat(times, fn) {
      return function() {
        var p = Promise.resolve();
        var n = 0;
        for ( var i = 0; i < times; ++i ) {
          p = p.then(function() { return fn(n++); });
        }
        return p;
      };
    }

    function arepeatpar(times, fn) {
      return function() {
        var promises = [];
        for ( var i = 0; i < times; ++i ) {
          promises[i] = fn(i);
        }
        return Promise.all(promises);
      };
    }

    function alog() {
      var args = arguments;
      return function() {
        console.log.apply(console, args);
      };
    }

    function asleep(time) {
      return function() {
        return new Promise(function(resolve, reject) {
          setTimeout(function() { resolve(); }, time);
        });
      };
    }

    function CachedIDB(dao) {
      //var name = dao.model.name;
      //var idb = foam.dao.IDBDAO.create({of: dao.model});

      //dao = foam.dao.CachingDAO.create({cache: dao, src: idb});
      // if ( DEBUG ) dao = TimingDAO.create(name, dao);
      return dao;
    }

    foam.CLASS({
      name: 'Photo',
      properties: [
        { name: 'id' },
        { name: 'hash' },
        { class: 'Boolean', name: 'isLocal' },
        { class: 'Boolean', name: 'byAction' },
        { class: 'Date', name: 'timestamp' },
        { name: 'albumId' },
        { class: 'Boolean', name: 'isCoverPhoto' },
        { name: 'jspb', hidden: true }
      ]
    });

    foam.CLASS({
      name: 'Album',
      properties: [
        { name: 'id', name: 'id' },
        { class: 'Boolean', name: 'isLocal' },
        { class: 'Boolean', name: 'byAction' },
        { class: 'Date', name: 'timestamp' },
        { name: 'jspb', hidden: true }
      ],
      relationships: [
        { model_: 'Relationship', relatedModel: 'Photo', relatedProperty: 'albumId' }
      ]
    });

    // Note: The 'relationships' feature is not used in these benchmarks, but to use this feature, you would do:
    // albums[0].Photos.select(console.log)


    var AlbumDAO, PhotoDAO;
    var albums = foam.dao.ArraySink.create();
    var photos = foam.dao.ArraySink.create();

    function makeMultiPartKeys(n) {
      var a = [];
      for ( var i = 0 ; i < n ; i++ ) {
        a.push(""+(Math.floor(NUM_PHOTOS/n)*i));
      }
      return a;
    }

    var M = foam.mlang.Expressions.create();

    var KEYS_10 = makeMultiPartKeys(10);
    var KEYS_100 = makeMultiPartKeys(100);
    var KEYS_1000 = makeMultiPartKeys(1000);
    var KEYS_5000 = makeMultiPartKeys(5000);

    //var SUM_PHOTO_COUNT = SUM({f:function(photo) { return photo.jspb[9] || 0; }});

    PhotoDAO = CachedIDB(foam.dao.MDAO.create({of: Photo})
    //  This index isn't worthwhile with only 10 photos / album
    //  .addRawIndex(TreeIndex.create(Photo.ALBUM_ID, mLangIndex.create(SUM_PHOTO_COUNT)))
      .addIndex(Photo.ALBUM_ID)
      .addIndex(Photo.TIMESTAMP)
      .addIndex(Photo.IS_LOCAL));
    AlbumDAO = CachedIDB(foam.dao.MDAO.create({of: Album})
     .addIndex(Album.IS_LOCAL)
     .addIndex(Album.TIMESTAMP)
    );

    /*
    AlbumDAO = CascadingRemoveDAO.create({
      delegate: AlbumDAO,
      childDAO: PhotoDAO,
      property: Photo.ALBUM_ID});
    */
    var avgKey = ""+Math.floor(NUM_PHOTOS/2)/*.toString()*/;
    var avgAlbumKey = ""+Math.floor(NUM_ALBUMS/2)/*.toString()*/;

    function runPhotoBenchmarks() {
    Promise.resolve().then(aseq(
      atest('CreateTestAlbums' + NUM_ALBUMS, arepeat(NUM_ALBUMS, function ( i) {
        albums.put(
          Album.create({
            id: ""+i,
            isLocal: !! ( i % 2 ),
            byAction: !! ( 1 - (i % 2) ),
            timestamp: new Date( ( Date.now() - 1000*60*60*24 * 300 ) + Math.random() * 1000*60*60*24 * 300),
            jspb: [ 'nothing!' ],
          })
        );
      })),
      atest('CreateTestPhotos' + NUM_PHOTOS, arepeat(NUM_PHOTOS, function ( i) {
        photos.put(
          Photo.create({
            id: ""+i,
            timestamp: new Date( ( Date.now() - 1000*60*60*24 * 300 ) + Math.random() * 1000*60*60*24 * 300),
            isLocal: !! ( i % 2 ),
            byAction: !! ( 1 - (i % 2) ),
            albumId: ""+(i % NUM_ALBUMS),
            isCoverPhoto: ( i % 3 ) > 0,
            jspb: [ 'nothing!' ],
          })
        );
      })),
      arepeat(DEBUG ? 1 : 7,
        aseq(
          alog('Benchmark...'),
          atest('1a CreateAlbums' + NUM_ALBUMS,
//             arepeatpar(NUM_ALBUMS, function ( i) {
//                 return AlbumDAO.put(albums.a[i]);
//             })
            function() {
              var dao = foam.dao.ArrayDAO.create({ array: albums.a });
              return AlbumDAO.bulkLoad(dao);
            }
          ),
          asleep(1000),
          atest('1b CreatePhotos' + NUM_PHOTOS, function() {
//             arepeatpar(NUM_PHOTOS, function ( i) {
//                 return PhotoDAO.put(photos.a[i]);
//             })
            var dao = foam.dao.ArrayDAO.create({ array: photos.a });
            return PhotoDAO.bulkLoad(dao);
          }),
          asleep(1000),
          atest('2a SelectAllAlbumsQuery', function() {
            return AlbumDAO.select()
              .then(function(s) { expect(s.a.length).toEqual(NUM_ALBUMS); });
          }),
          atest('2a SelectAllPhotosQuery', function() {
            return PhotoDAO.select()
              .then(function(s) { expect(s.a.length).toEqual(NUM_PHOTOS); });
          }),
          atest('2b SingleKeyQuery',       function() {
            return PhotoDAO.find(avgKey);
          }),
          atest('2b SingleKeyQuery(X100)',
            arepeat(100, function() {
              return PhotoDAO.find(avgKey);
            })
          ),
          atest('2c MultiKeyQuery10',   function() {
//             var asink = M.EXPLAIN(foam.dao.ArraySink.create());
//             PhotoDAO.where(M.IN(Photo.ID, KEYS_10)).select(asink)
//               .then(function(s) {
//                 //console.log("2c10 Explain:", asink.toString());
//               });
            return PhotoDAO.where(M.IN(Photo.ID, KEYS_10)).select()
              .then(function(s) {
                expect(s.a.length).toEqual(10);
              });
          }),
          atest('2c MultiKeyQuery100',  function() {
//             var asink = M.EXPLAIN(foam.dao.ArraySink.create());
//             PhotoDAO.where(M.IN(Photo.ID, KEYS_100)).select(asink)
//               .then(function(s) {
//                 //console.log("2c100 Explain:", asink.toString());
//               });
            return PhotoDAO.where(M.IN(Photo.ID, KEYS_100)).select()
              .then(function(s) { expect(s.a.length).toEqual(100); });
          }),
          atest('2c MultiKeyQuery1000', function() {
//             var asink = M.EXPLAIN(foam.dao.ArraySink.create());
//             PhotoDAO.where(M.IN(Photo.ID, KEYS_1000)).select(asink)
//               .then(function(s) {
//                 //console.log("2c1000 Explain:", asink.toString());
//               });
            return PhotoDAO.where(M.IN(Photo.ID, KEYS_1000)).select()
              .then(function(s) { expect(s.a.length).toEqual(1000); });
          }),
          atest('2cMultiKeyQuery5000', function() {
//             var asink = M.EXPLAIN(foam.dao.ArraySink.create());
//             PhotoDAO.where(M.IN(Photo.ID, KEYS_5000)).select(asink)
//               .then(function(s) {
//                 //console.log("2c5000 Explain:", asink.toString());
//               });
            return PhotoDAO.where(M.IN(Photo.ID, KEYS_5000)).select()
              .then(function(s) { expect(s.a.length).toEqual(5000); });
          }),

          atest('2d IndexedFieldQuery', function() {
            var asink = foam.dao.ArraySink.create();
            return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgAlbumKey)).select(
              M.MAP(Photo.ALBUM_ID, asink)
            ).then(function() {
              expect(asink.a.length).toEqual(10);
            });
          }),
          atest('2d IndexedFieldQuery(X100)', arepeat(100, function() {
            return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgAlbumKey)).select(
              M.MAP(Photo.ALBUM_ID, foam.dao.ArraySink.create())
            );
          })),

          atest('2e AdHocFieldQuery',  function() {
            return PhotoDAO.where(M.EQ(Photo.IS_LOCAL, true)).select(
              M.MAP(Photo.HASH, foam.dao.ArraySink.create())
            );
          }),
//           atest('2e AdHocFieldQuery(x100)', arepeat(100, function() {
//             return PhotoDAO.where(M.EQ(Photo.IS_LOCAL, true)).select(
//               M.MAP(Photo.HASH, foam.dao.ArraySink.create())
//             );
//           })),
          atest('2f SimpleInnerJoinQuery',  function() {
            var idsink = foam.dao.ArraySink.create();
            return AlbumDAO.where(M.EQ(Album.IS_LOCAL, false)).select(M.MAP(Album.ID, idsink)).then(function (idsmapsink) {
              return PhotoDAO.where(M.IN(Photo.ALBUM_ID, idsink.a)).select().then(function(csink) {
                expect(csink.a.length).toEqual(NUM_PHOTOS / 2);
              });
            })
          }),
        //  atest('2f SimpleInnerJoinQuery(Simpler+Slower Version)', new Promise( function() {
        //    AlbumDAO.where(M.EQ(Album.IS_LOCAL, true)).select(M.MAP(JOIN(PhotoDAO, Photo.ALBUM_ID, []), []))(ret);
        //  }),
      //     atest('2g SimpleInnerJoinAggregationQuery', new Promise( function() {
      //       AlbumDAO.where(M.EQ(Album.IS_LOCAL, false)).select(M.MAP(Album.ID))(function (ids) {
      //         PhotoDAO.where(M.IN(Photo.ALBUM_ID, ids.arg2)).select(M.GROUP_BY(Photo.ALBUM_ID, SUM_PHOTO_COUNT))(ret);
      //     })}),
        //  atest('2g SimpleInnerJoinAggregationQuery(Simpler+Slower Version', new Promise( function() {
        //    AlbumDAO.where(M.EQ(Album.IS_LOCAL, false)).select(
        //        M.MAP(JOIN(PhotoDAO, Photo.ALBUM_ID, SUM_PHOTO_COUNT), []))(ret);
        //  }),
          atest('2h SimpleOrderByQuery', function() {
            return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgAlbumKey)).orderBy(M.DESC(Photo.TIMESTAMP)).select();
          }),
          atest('2h SimpleOrderByQuery(X100)', arepeat(100, function() {
            return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgAlbumKey)).orderBy(M.DESC(Photo.TIMESTAMP)).select();
          })),
//           atest('2j AscOrderByQuery', function() {
//             return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgAlbumKey)).orderBy(Photo.TIMESTAMP).select();
//           }),
//           atest('2j AscOrderByQuery(X100)', arepeat(100, function() {
//             return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgAlbumKey)).orderBy(Photo.TIMESTAMP).select();
//           })),
      //     atest('2i SimpleOrderAndGroupByQuery', new Promise( function() {
      //       PhotoDAO
      //         .where(M.AND(GTE(Photo.TIMESTAMP, new Date(96, 0, 1)), M.LT(Photo.TIMESTAMP, new Date(96, 2, 1))))
      //         .orderBy(M.DESC(Photo.TIMESTAMP))
      //         .select(M.GROUP_BY(MONTH(Photo.TIMESTAMP)))(ret);
      //     }),
      //    atest('2jSimpleAggregationQuery', new Promise( function() { PhotoDAO.select(M.GROUP_BY(Photo.ALBUM_ID))(ret); }),
        /*
          atest('3a CreateAndUpdate', atxn(arepeat(DEBUG ? 10 : 1000, (function ( i) { AlbumDAO.put(randomAlbum(i*2), ret); }))),
          atest('3b Setup', atxn(new Promise( function() {
            AlbumDAO.put(randomAlbum('test')),
            arepeat(DEBUG ? 10 : 1000, function(ret, i) { PhotoDAO.put(randomPhoto('test', i), ret); })(ret);
          })),
          atest('3b CascadingDelete', atxn(new Promise( function() { AlbumDAO.remove('3', ret); })),
          */
          atest('Cleanup', function() {
            return AlbumDAO.removeAll().then(PhotoDAO.removeAll());
          })
          ,asleep(5000)
        )
      ),
      alog('Done.'),
      done
    ));
    }

    runPhotoBenchmarks();

  });
});
