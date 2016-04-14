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
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

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
      var startTime = Date.now();
      if ( ! promise.then ) {
        promise = promise();
      }
      var fn = function(arg) {
        var endTime = Date.now();
        console.log("Time for ", name, ": ", endTime - startTime, "ms");
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
        { type: 'Boolean', name: 'isLocal' },
        { type: 'Boolean', name: 'byAction' },
        { type: 'DateTime', name: 'timestamp' },
        { name: 'albumId' },
        { type: 'Boolean', name: 'isCoverPhoto' },
        { name: 'jspb', hidden: true }
      ]
    });

    foam.CLASS({
      name: 'Album',
      properties: [
        { name: 'id', name: 'id' },
        { type: 'Boolean', name: 'isLocal' },
        { type: 'Boolean', name: 'byAction' },
        { type: 'DateTime', name: 'timestamp' },
        { name: 'jspb', hidden: true }
      ],
      relationships: [
        { model_: 'Relationship', relatedModel: 'Photo', relatedProperty: 'albumId' }
      ]
    });

    // Note: The 'relationships' feature is not used in these benchmarks, but to use this feature, you would do:
    // albums[0].Photos.select(console.log)

    foam.CLASS({
      model_: 'Model',
      name: 'PhotoDetail',
      properties: [
        { type: 'Int', name: 'id' },
        { name: 'photoId' },
        { name: 'albumId' },
        { name: 'hash' },
        { type: 'Int', name: 'totalComments' }
      ]
    });

    var AlbumDAO, PhotoDAO, PhotoDetailDAO;
    var albums = foam.dao.ArraySink.create();
    var photos = foam.dao.ArraySink.create();

    function makeMultiPartKeys(n) {
      var a = [];
      for ( var i = 0 ; i < n ; i++ ) {
        a.push((Math.floor(NUM_PHOTOS/n)*i).toString());
      }
      return a;
    }

    var M = foam.mlang.Expressions.create();

    var KEYS_10 = makeMultiPartKeys(10);
    var KEYS_100 = makeMultiPartKeys(100);
    var KEYS_1000 = makeMultiPartKeys(1000);
    var KEYS_5000 = makeMultiPartKeys(5000);

    //var SUM_PHOTO_COUNT = SUM({f:function(photo) { return photo.jspb[9] || 0; }});

    PhotoDetailDAO = CachedIDB(foam.dao.MDAO.create({of: PhotoDetail})
      .addIndex(PhotoDetail.PHOTO_ID)
      .addIndex(PhotoDetail.ALBUM_ID));
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
    var avgKey = Math.floor(NUM_PHOTOS/2).toString();
    var avgAlbumKey = Math.floor(NUM_ALBUMS/2).toString();

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
            albumId: i % NUM_ALBUMS, // do we want to evenly distribute?
            isCoverPhoto: ( i % 3 ) > 0,
            jspb: [ 'nothing!' ],
          })
        );
      })),
      //new Promise( function(resolve, reject) { console.clear(); testData = undefined; resolve(); } ),
      arepeat(DEBUG ? 1 : 3,
        aseq(
          alog('Benchmark...'),
          atest('1aCreateAlbums' + NUM_ALBUMS, arepeatpar(NUM_ALBUMS, function ( i) {
            return AlbumDAO.put(albums.a[i]);
          })),
          asleep(1000),
          atest('1bCreatePhotos' + NUM_PHOTOS, arepeatpar(NUM_PHOTOS, function ( i) {
            return PhotoDAO.put(photos.a[i]);
          })),
          asleep(2000),
          atest('2aSelectAllAlbumsQuery', function() {
            return AlbumDAO.select();
          }),
          atest('2aSelectAllPhotosQuery', function() {
            return PhotoDAO.select();
          }),
          atest('2bSingleKeyQuery',       function() {
            return PhotoDAO.find(avgKey);
          }),
          atest('2bSingleKeyQuery(X10)',
            arepeat(10, function() {
              return PhotoDAO.find(avgKey);
            })
          ),
          atest('2cMultiKeyQuery10',   function() {
            return PhotoDAO.where(M.IN(Photo.ID, KEYS_10)).select(); } ),

          atest('2cMultiKeyQuery100',  function() {
            return PhotoDAO.where(M.IN(Photo.ID, KEYS_100)).select(); } ),
          atest('2cMultiKeyQuery1000', function() {
            return PhotoDAO.where(M.IN(Photo.ID, KEYS_1000)).select(); } ),
          atest('2cMultiKeyQuery5000', function() {
            return PhotoDAO.where(M.IN(Photo.ID, KEYS_5000)).select(); } ),

          atest('2dIndexedFieldQuery', function() {
            return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgKey)).select(
              M.MAP(Photo.ALBUM_ID, foam.dao.ArraySink.create())
            );
          }),
          atest('2dIndexedFieldQuery(X100)', arepeat(100, function() {
            return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgKey)).select(
              M.MAP(Photo.ALBUM_ID, foam.dao.ArraySink.create())
            );
          })),

          atest('2eAdHocFieldQuery',  function() {
            return PhotoDAO.where(M.EQ(Photo.IS_LOCAL, true)).select(
              M.MAP(Photo.HASH, foam.dao.ArraySink.create())
            );
          }),
          atest('2eAdHocFieldQuery(x100)', arepeat(100, function() {
            return PhotoDAO.where(M.EQ(Photo.IS_LOCAL, true)).select(
              M.MAP(Photo.HASH, foam.dao.ArraySink.create())
            );
          })),
          atest('2fSimpleInnerJoinQuery',  function() {
            var idsink = foam.dao.ArraySink.create();
            return AlbumDAO.where(M.EQ(Album.IS_LOCAL, false)).select(M.MAP(Album.ID, idsink)).then(function (idsmapsink) {
              return PhotoDAO.where(M.IN(Photo.ALBUM_ID, idsink.a)).select(foam.mlang.sink.Count.create()).then(function(csink) {
                return csink.value;
              });
            })
          }),
        //  atest('2fSimpleInnerJoinQuery(Simpler+Slower Version)', new Promise( function() {
        //    AlbumDAO.where(M.EQ(Album.IS_LOCAL, true)).select(M.MAP(JOIN(PhotoDAO, Photo.ALBUM_ID, []), []))(ret);
        //  }),
      //     atest('2gSimpleInnerJoinAggregationQuery', new Promise( function() {
      //       AlbumDAO.where(M.EQ(Album.IS_LOCAL, false)).select(M.MAP(Album.ID))(function (ids) {
      //         PhotoDAO.where(M.IN(Photo.ALBUM_ID, ids.arg2)).select(M.GROUP_BY(Photo.ALBUM_ID, SUM_PHOTO_COUNT))(ret);
      //     })}),
        //  atest('2gSimpleInnerJoinAggregationQuery(Simpler+Slower Version', new Promise( function() {
        //    AlbumDAO.where(M.EQ(Album.IS_LOCAL, false)).select(
        //        M.MAP(JOIN(PhotoDAO, Photo.ALBUM_ID, SUM_PHOTO_COUNT), []))(ret);
        //  }),
          atest('2hSimpleOrderByQuery', function() {
            return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgAlbumKey)).orderBy(M.DESC(Photo.TIMESTAMP)).select();
          }),
          atest('2hSimpleOrderByQuery(X100)', arepeat(100, function() {
            return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgAlbumKey)).orderBy(M.DESC(Photo.TIMESTAMP)).select();
          })),
          atest('2jAscOrderByQuery', function() {
            return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgAlbumKey)).orderBy(Photo.TIMESTAMP).select();
          }),
          atest('2jAscOrderByQuery(X100)', arepeat(100, function() {
            return PhotoDAO.where(M.EQ(Photo.ALBUM_ID, avgAlbumKey)).orderBy(Photo.TIMESTAMP).select();
          })),
      //     atest('2iSimpleOrderAndGroupByQuery', new Promise( function() {
      //       PhotoDAO
      //         .where(M.AND(GTE(Photo.TIMESTAMP, new Date(96, 0, 1)), M.LT(Photo.TIMESTAMP, new Date(96, 2, 1))))
      //         .orderBy(M.DESC(Photo.TIMESTAMP))
      //         .select(M.GROUP_BY(MONTH(Photo.TIMESTAMP)))(ret);
      //     }),
      //    atest('2jSimpleAggregationQuery', new Promise( function() { PhotoDAO.select(M.GROUP_BY(Photo.ALBUM_ID))(ret); }),
        /*
          atest('3aCreateAndUpdate', atxn(arepeat(DEBUG ? 10 : 1000, (function ( i) { AlbumDAO.put(randomAlbum(i*2), ret); }))),
          atest('3bSetup', atxn(new Promise( function() {
            AlbumDAO.put(randomAlbum('test')),
            arepeat(DEBUG ? 10 : 1000, function(ret, i) { PhotoDAO.put(randomPhoto('test', i), ret); })(ret);
          })),
          atest('3bCascadingDelete', atxn(new Promise( function() { AlbumDAO.remove('3', ret); })),
          */
          atest('Cleanup', function() {
            return AlbumDAO.removeAll().then(PhotoDAO.removeAll());
          })
          //,asleep(10000)
        )
      ),
      alog('Done.'),
      done
    ));
    }

    runPhotoBenchmarks();

  });
});
