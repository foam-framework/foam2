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


// describe('MDAO TreeIndex', function() {

//   var NUM_ALBUMS = 1000;
//   var NUM_PHOTOS = 10000;

//   var AlbumDAO, PhotoDAO, PhotoDetailDAO, albums, photos;

//   albums = foam.dao.ArrayDAO.create();
//   photos = foam.dao.ArrayDAO.create();
//   for ( var i = 0; i < NUM_ALBUMS; ++i ) {
//     albums.put(
//       Album.create({
//         id: ""+i,
//         isLocal: !! ( i % 2 ),
//         byAction: !! ( 1 - (i % 2) ),
//         timestamp: new Date( ( Date.now() - 1000*60*60*24 * 300 ) + Math.random() * 1000*60*60*24 * 300),
//         jspb: [ 'nothing!' ],
//       })
//     );
//   }
//   for ( var i = 0; i < NUM_PHOTOS; ++i ) {
//     photos.put(
//       Photo.create({
//         id: ""+i,
//         timestamp: new Date( ( Date.now() - 1000*60*60*24 * 300 ) + Math.random() * 1000*60*60*24 * 300),
//         isLocal: !! ( i % 2 ),
//         byAction: !! ( 1 - (i % 2) ),
//         albumId: ""+(i % NUM_ALBUMS),
//         isCoverPhoto: ( i % 3 ) > 0,
//         jspb: [ 'nothing!' ],
//       })
//     );
//   }


//   var avgKey = ""+Math.floor(NUM_PHOTOS/2)/*.toString()*/;
//   var avgAlbumKey = ""+Math.floor(NUM_ALBUMS/2)/*.toString()*/;

//   function makeMultiPartKeys(n) {
//     var a = [];
//     for ( var i = 0 ; i < n ; i++ ) {
//       a.push(""+(Math.floor(NUM_PHOTOS/n)*i));
//     }
//     return a;
//   }

//   var M = foam.mlang.Expressions.create();

//   var KEYS_10 = makeMultiPartKeys(10);
//   var KEYS_100 = makeMultiPartKeys(100);
//   var KEYS_1000 = makeMultiPartKeys(1000);
//   var KEYS_5000 = makeMultiPartKeys(5000);

//   beforeEach(function() {
//     foam.CLASS({
//       package: 'test',
//       name: 'Photo',
//       properties: [
//         { name: 'id' },
//         { name: 'hash' },
//         { type: 'Boolean', name: 'isLocal' },
//         { type: 'Boolean', name: 'byAction' },
//         { type: 'DateTime', name: 'timestamp' },
//         { name: 'albumId' },
//         { type: 'Boolean', name: 'isCoverPhoto' },
//         { name: 'jspb', hidden: true }
//       ]
//     });

//     foam.CLASS({
//       package: 'test',
//       name: 'Album',
//       properties: [
//         { name: 'id', name: 'id' },
//         { type: 'Boolean', name: 'isLocal' },
//         { type: 'Boolean', name: 'byAction' },
//         { type: 'DateTime', name: 'timestamp' },
//         { name: 'jspb', hidden: true }
//       ],
//       relationships: [
//         { model_: 'Relationship', relatedModel: 'Photo', relatedProperty: 'albumId' }
//       ]
//     });


//     PhotoDAO = foam.dao.MDAO.create({of: test.Photo})
//       .addIndex(test.Photo.ALBUM_ID)
//       .addIndex(test.Photo.TIMESTAMP)
//       .addIndex(test.Photo.IS_LOCAL);
//     AlbumDAO = foam.dao.MDAO.create({of: test.Album})
//      .addIndex(test.Album.IS_LOCAL)
//      .addIndex(test.Album.TIMESTAMP);

//   });
//   afterEach(function() {

//   });

//   it('bulk loads', function() {
//     AlbumDAO.bulkLoad(albums).then(function() {

//     }).then(PhotoDAO.bulkLoad(photos)).then(function() {

//     });



//   });


// });



