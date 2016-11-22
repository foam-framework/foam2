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


describe('MDAO with TreeIndex', function() {

  var NUM_ALBUMS = 10;
  var NUM_PHOTOS = 100;

  foam.CLASS({
    package: 'test',
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
    package: 'test',
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


  var AlbumDAO, PhotoDAO, PhotoDetailDAO, albums, photos;
  var NOW = 1461778131578; // reasonable Date.now() substitute
  var MS_PER_DAY = 1000*60*60*24;

  albums = foam.dao.ArrayDAO.create(undefined, foam.__context__);
  photos = foam.dao.ArrayDAO.create(undefined, foam.__context__);
  for ( var i = 0; i < NUM_ALBUMS; ++i ) {
    albums.put(
      test.Album.create({
        id: ""+i,
        isLocal: !! ( i % 2 ),
        byAction: !! ( 1 - (i % 2) ),
        timestamp: new Date( ( NOW - MS_PER_DAY * 300 ) + (1 - i/NUM_ALBUMS) * MS_PER_DAY * 300),
        jspb: [ 'nothing!' ],
      }, foam.__context__)
    );
  }
  for ( var i = 0; i < NUM_PHOTOS; ++i ) {
    photos.put(
      test.Photo.create({
        id: ""+i,
        timestamp: new Date( ( NOW - MS_PER_DAY * 300 ) + (1 - i/NUM_PHOTOS) * MS_PER_DAY * 300),
        isLocal: !! ( i % 2 ),
        byAction: !! ( 1 - (i % 2) ),
        albumId: ""+(i % NUM_ALBUMS),
        isCoverPhoto: ( i % 3 ) > 0,
        jspb: [ 'nothing!' ],
      }, foam.__context__)
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

  var M = foam.mlang.Expressions.create(undefined, foam.__context__);

  var KEYS_SINGLE = makeMultiPartKeys(1);
  var KEYS_A_FEW = makeMultiPartKeys(10);
  var KEYS_LOTS = makeMultiPartKeys(100);

  beforeEach(function(done) {
    PhotoDAO = foam.dao.MDAO.create({of: test.Photo}, foam.__context__)
      .addPropertyIndex(test.Photo.ALBUM_ID)
      .addPropertyIndex(test.Photo.TIMESTAMP)
      .addPropertyIndex(test.Photo.IS_LOCAL);
    AlbumDAO = foam.dao.MDAO.create({of: test.Album}, foam.__context__)
     .addPropertyIndex(test.Album.IS_LOCAL)
     .addPropertyIndex(test.Album.TIMESTAMP);

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
    PhotoDAO.where(M.IN(test.Photo.ID, KEYS_SINGLE)).select()
      .then(
        function(s) { expect(s.a.length).toEqual(KEYS_SINGLE.length); }
      ).then(
        PhotoDAO.where(M.IN(test.Photo.ID, KEYS_A_FEW)).select()
          .then(function(s) { expect(s.a.length).toEqual(KEYS_A_FEW.length); })
      ).then(
        PhotoDAO.where(M.IN(test.Photo.ID, KEYS_LOTS)).select()
          .then(function(s) { expect(s.a.length).toEqual(KEYS_LOTS.length); })
      ).then(done);
  });

  it('innner joins', function(done) {
    var idsink = foam.dao.ArraySink.create(undefined, foam.__context__);
    return AlbumDAO.where(M.EQ(test.Album.IS_LOCAL, false)).select(M.MAP(test.Album.ID, idsink))
      .then(function (idsmapsink) {
        return PhotoDAO.where(M.IN(test.Photo.ALBUM_ID, idsink.a)).select().then(function(csink) {
          expect(csink.a.length).toEqual(NUM_PHOTOS / 2);
        });
      }).then(done);
  });

  it ('orders', function(done) {
    var asink = foam.dao.ArraySink.create(undefined, foam.__context__);
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
    var asink = foam.dao.ArraySink.create(undefined, foam.__context__);
    var cutOff = NOW - MS_PER_DAY * 10;
    PhotoDAO
      .orderBy(M.DESC(test.Photo.TIMESTAMP))
      .where(M.GT(test.Photo.TIMESTAMP, cutOff))
      .select(asink).then(function() {
        var a = asink.a;
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() >= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime()).toBeGreaterThan(cutOff);
          prev = a[i];
        }
      }).then(done);
  });

  it ('orders and filters gt/asc', function(done) {
    var asink = foam.dao.ArraySink.create(undefined, foam.__context__);
    var cutOff = NOW - MS_PER_DAY * 10;
    PhotoDAO
      .orderBy(test.Photo.TIMESTAMP)
      .where(M.GT(test.Photo.TIMESTAMP, cutOff))
      .select(asink).then(function() {
        var a = asink.a;
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() <= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime()).toBeGreaterThan(cutOff);
          prev = a[i];
        }
      }).then(done);
  });

  it ('orders and filters lt/desc', function(done) {
    var asink = foam.dao.ArraySink.create(undefined, foam.__context__);
    var cutOff = NOW - MS_PER_DAY * 10;
    PhotoDAO
      .orderBy(M.DESC(test.Photo.TIMESTAMP))
      .where(M.LT(test.Photo.TIMESTAMP, cutOff))
      .select(asink).then(function() {
        var a = asink.a;
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() >= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime()).toBeLessThan(cutOff);
          prev = a[i];
        }
      }).then(done);
  });

  it ('orders and filters lt/asc', function(done) {
    var asink = foam.dao.ArraySink.create(undefined, foam.__context__);
    var cutOff = NOW - MS_PER_DAY * 10;
    PhotoDAO
      .orderBy(test.Photo.TIMESTAMP)
      .where(M.LT(test.Photo.TIMESTAMP, cutOff))
      .select(asink).then(function() {
        var a = asink.a;
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() <= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime()).toBeLessThan(cutOff);
          prev = a[i];
        }
      }).then(done);
  });

  it ('orders and filters a range', function(done) {
    var asink = foam.dao.ArraySink.create(undefined, foam.__context__);
    var lower = NOW - MS_PER_DAY * 100;
    var upper = NOW - MS_PER_DAY * 20;
    PhotoDAO
      .orderBy(test.Photo.TIMESTAMP)
      .where(M.AND(M.LT(test.Photo.TIMESTAMP, upper), M.GT(test.Photo.TIMESTAMP, lower)))
      .select(asink).then(function() {
        var a = asink.a;
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() <= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime()).toBeLessThan(upper);
          expect(prev.timestamp.getTime()).toBeGreaterThan(lower);
          prev = a[i];
        }
      }).then(done);
  });

  it ('order, range, limit', function(done) {
    var asink = foam.dao.ArraySink.create(undefined, foam.__context__);
    var lower = NOW - MS_PER_DAY * 100;
    var upper = NOW - MS_PER_DAY * 20;

    var countSink = foam.mlang.sink.Count.create(undefined, foam.__context__);
    PhotoDAO
      .orderBy(test.Photo.TIMESTAMP)
      .where(M.AND(M.LT(test.Photo.TIMESTAMP, upper), M.GT(test.Photo.TIMESTAMP, lower)))
      .select(countSink);

    PhotoDAO
      .orderBy(test.Photo.TIMESTAMP)
      .where(M.AND(M.LT(test.Photo.TIMESTAMP, upper), M.GT(test.Photo.TIMESTAMP, lower)))
      .limit(countSink.value - 5)
      .select(asink).then(function() {
        var a = asink.a;
        expect(a.length).toEqual(countSink.value - 5);
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() <= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime()).toBeLessThan(upper);
          expect(prev.timestamp.getTime()).toBeGreaterThan(lower);
          prev = a[i];
        }
      }).then(done);
  });

  it ('order, range, skip', function(done) {
    var asink = foam.dao.ArraySink.create(undefined, foam.__context__);
    var lower = NOW - MS_PER_DAY * 100;
    var upper = NOW - MS_PER_DAY * 20;

    var countSink = foam.mlang.sink.Count.create(undefined, foam.__context__);
    PhotoDAO
      .orderBy(M.DESC(test.Photo.TIMESTAMP))
      .where(M.AND(M.LT(test.Photo.TIMESTAMP, upper), M.GT(test.Photo.TIMESTAMP, lower)))
      .select(countSink);

    PhotoDAO
      .orderBy(M.DESC(test.Photo.TIMESTAMP))
      .where(M.AND(M.LT(test.Photo.TIMESTAMP, upper), M.GT(test.Photo.TIMESTAMP, lower)))
      .skip(countSink.value - 5) // skip all but 5
      .select(asink).then(function() {
        var a = asink.a;
        expect(a.length).toEqual(5);
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() >= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime()).toBeLessThan(upper);
          expect(prev.timestamp.getTime()).toBeGreaterThan(lower);
          prev = a[i];
        }
      }).then(done);
  });

  it ('filters inverted range', function(done) {
    // Pick the items NOT in the range
    var asink = foam.dao.ArraySink.create(undefined, foam.__context__);
    var lower = NOW - MS_PER_DAY * 100;
    var upper = NOW - MS_PER_DAY * 20;
    PhotoDAO
      .orderBy(test.Photo.TIMESTAMP)
      .where(M.OR(M.GT(test.Photo.TIMESTAMP, upper), M.LT(test.Photo.TIMESTAMP, lower)))
      .select(asink).then(function() {
        var a = asink.a;
        var prev = a[0];
        for ( var i = 1; i < a.length; ++i ) {
          expect(prev.timestamp.getTime() <= a[i].timestamp.getTime()).toEqual(true);
          expect(prev.timestamp.getTime() > upper ||
                 prev.timestamp.getTime() < lower).toBe(true);
          prev = a[i];
        }
      }).then(done);
  });


});






