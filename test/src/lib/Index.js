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


describe('MDAO TreeIndex', function() {

  var NUM_ALBUMS = 100;
  var NUM_PHOTOS = 1000;

  foam.CLASS({
    package: 'test',
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
    package: 'test',
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


  var AlbumDAO, PhotoDAO, PhotoDetailDAO, albums, photos;
  var NOW = 1461778131578; // reasonable Date.now() substitute

  albums = foam.dao.ArrayDAO.create();
  photos = foam.dao.ArrayDAO.create();
  for ( var i = 0; i < NUM_ALBUMS; ++i ) {
    albums.put(
      test.Album.create({
        id: ""+i,
        isLocal: !! ( i % 2 ),
        byAction: !! ( 1 - (i % 2) ),
        timestamp: new Date( ( NOW - 1000*60*60*24 * 300 ) + (1 - i/NUM_ALBUMS) * 1000*60*60*24 * 300),
        jspb: [ 'nothing!' ],
      })
    );
  }
  for ( var i = 0; i < NUM_PHOTOS; ++i ) {
    photos.put(
      test.Photo.create({
        id: ""+i,
        timestamp: new Date( ( NOW - 1000*60*60*24 * 300 ) + (1 - i/NUM_PHOTOS) * 1000*60*60*24 * 300),
        isLocal: !! ( i % 2 ),
        byAction: !! ( 1 - (i % 2) ),
        albumId: ""+(i % NUM_ALBUMS),
        isCoverPhoto: ( i % 3 ) > 0,
        jspb: [ 'nothing!' ],
      })
    );
  }


  var avgKey = ""+Math.floor(NUM_PHOTOS/2)/*.toString()*/;
  var avgAlbumKey = ""+Math.floor(NUM_ALBUMS/2)/*.toString()*/;

  function makeMultiPartKeys(n) {
    var a = [];
    for ( var i = 0 ; i < n ; i++ ) {
      a.push(""+(Math.floor(NUM_PHOTOS/n)*i));
    }
    return a;
  }

  var M = foam.mlang.Expressions.create();

  var KEYS_10 = makeMultiPartKeys(1);
  var KEYS_100 = makeMultiPartKeys(10);
  var KEYS_1000 = makeMultiPartKeys(100);
  var KEYS_5000 = makeMultiPartKeys(1000);

  beforeEach(function(done) {
    PhotoDAO = foam.dao.MDAO.create({of: test.Photo})
      .addIndex(test.Photo.ALBUM_ID)
      .addIndex(test.Photo.TIMESTAMP)
      .addIndex(test.Photo.IS_LOCAL);
    AlbumDAO = foam.dao.MDAO.create({of: test.Album})
     .addIndex(test.Album.IS_LOCAL)
     .addIndex(test.Album.TIMESTAMP);

    AlbumDAO.bulkLoad(albums).then(PhotoDAO.bulkLoad(photos)).then(done);
  });

  afterEach(function() {

  });

  it('bulk loads', function(done) {
    AlbumDAO.select().then(function(s) {
      expect(s.a.length).toEqual(NUM_ALBUMS);
    }).then(function() {
      PhotoDAO.select().then(function(s) {
        expect(s.a.length).toEqual(NUM_PHOTOS);
      }).then(done);
    })
  });

  it('selects with mutliple keys', function(done) {
    PhotoDAO.where(M.IN(test.Photo.ID, KEYS_10)).select()
      .then(
        function(s) { expect(s.a.length).toEqual(KEYS_10.length); }
      ).then(
        PhotoDAO.where(M.IN(test.Photo.ID, KEYS_100)).select()
          .then(function(s) { expect(s.a.length).toEqual(KEYS_100.length); })
      ).then(
        PhotoDAO.where(M.IN(test.Photo.ID, KEYS_1000)).select()
          .then(function(s) { expect(s.a.length).toEqual(KEYS_1000.length); })
      ).then(
        PhotoDAO.where(M.IN(test.Photo.ID, KEYS_5000)).select()
          .then(function(s) { expect(s.a.length).toEqual(KEYS_5000.length); })
      ).then(done);
  });

  it('innner joins', function(done) {
    var idsink = foam.dao.ArraySink.create();
    return AlbumDAO.where(M.EQ(test.Album.IS_LOCAL, false)).select(M.MAP(test.Album.ID, idsink))
      .then(function (idsmapsink) {
        return PhotoDAO.where(M.IN(test.Photo.ALBUM_ID, idsink.a)).select().then(function(csink) {
          expect(csink.a.length).toEqual(NUM_PHOTOS / 2);
        });
      }).then(done);
  });

  it ('orders', function(done) {
    var asink = foam.dao.ArraySink.create();
    PhotoDAO.where(M.EQ(test.Photo.ALBUM_ID, avgAlbumKey))
      .orderBy(M.DESC(test.Photo.TIMESTAMP)).select(asink).then(function() {
        var a = asink.a;
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() >= a[i].timestamp.getTime()).toEqual(true);
          prev = a[i];
        }
      }).then(done);
  });

  it ('orders and filters gt/desc', function(done) {
    var asink = foam.dao.ArraySink.create();
    var cutOff = NOW - 1000*60*60*24 * 10;
    PhotoDAO
      .orderBy(M.DESC(test.Photo.TIMESTAMP))
      .where(M.GT(test.Photo.TIMESTAMP, cutOff))
      .select(asink).then(function() {
        var a = asink.a;
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() >= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime() > cutOff).toEqual(true);
          prev = a[i];
        }
      }).then(done);
  });

  it ('orders and filters gt/asc', function(done) {
    var asink = foam.dao.ArraySink.create();
    var cutOff = NOW - 1000*60*60*24 * 10;
    PhotoDAO
      .orderBy(test.Photo.TIMESTAMP)
      .where(M.GT(test.Photo.TIMESTAMP, cutOff))
      .select(asink).then(function() {
        var a = asink.a;
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() <= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime() > cutOff).toEqual(true);
          prev = a[i];
        }
      }).then(done);
  });

  it ('orders and filters lt/desc', function(done) {
    var asink = foam.dao.ArraySink.create();
    var cutOff = NOW - 1000*60*60*24 * 10;
    PhotoDAO
      .orderBy(M.DESC(test.Photo.TIMESTAMP))
      .where(M.LT(test.Photo.TIMESTAMP, cutOff))
      .select(asink).then(function() {
        var a = asink.a;
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() >= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime() < cutOff).toEqual(true);
          prev = a[i];
        }
      }).then(done);
  });

  it ('orders and filters lt/asc', function(done) {
    var asink = foam.dao.ArraySink.create();
    var cutOff = NOW - 1000*60*60*24 * 10;
    PhotoDAO
      .orderBy(test.Photo.TIMESTAMP)
      .where(M.LT(test.Photo.TIMESTAMP, cutOff))
      .select(asink).then(function() {
        var a = asink.a;
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() <= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime() < cutOff).toEqual(true);
          prev = a[i];
        }
      }).then(done);
  });


});



