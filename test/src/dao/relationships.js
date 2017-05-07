/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

describe('relationships', function() {
  function equals(a, b) {
    return foam.util.equals(a, b);
  }
  function sortedEquals(a, b) {
    function sort(array) { return array.sort(foam.util.compare); }
    return equals(sort(a), sort(b));
  }

  describe('many-to-many', function() {
    var testCtx;
    var Artist;
    var Album;
    var ArtistAlbumJunction;
    var adam;
    var eve;
    var inTheBeginning;
    var eden;
    var temptation;
    function mkJunction(artist, album) {
      return ArtistAlbumJunction.create({
        id: [artist.id, album.id],
        sourceId: artist.id,
        targetId: album.id
      }, testCtx);
    }
    function relate(artist, album) {
      return testCtx.artistAlbumJunctionDAO.put(mkJunction(artist, album));
    }

    beforeEach(function(done) {
      foam.CLASS({
        package: 'foam.dao.test.left',
        name: 'Artist',

        ids: [ 'firstName', 'lastName' ],

        properties: [
          { class: 'String', name: 'firstName', required: true },
          { class: 'String', name: 'lastName',  required: true },
        ]
      });
      foam.CLASS({
        package: 'foam.dao.test.right',
        name: 'Album',

        ids: [ 'title' ],

        properties: [
          { class: 'String', name: 'title', required: true },
          { class: 'Int', name: 'releaseYear' },
        ]
      });
      foam.RELATIONSHIP({
        package: 'foam.dao.test',
        sourceModel: 'foam.dao.test.left.Artist',
        targetModel: 'foam.dao.test.right.Album',
        forwardName: 'albums',
        inverseName: 'artists',
        cardinality: '*:*',
      });

      foam.CLASS({
        name: 'Controller',
        package: 'foam.dao.test',

        requires: [
          'foam.dao.EasyDAO',
          'foam.dao.test.left.Artist',
          'foam.dao.test.right.Album',
          'foam.dao.test.ArtistAlbumJunction',
        ],
        exports: [
          'artistDAO',
          'albumDAO',
          'artistAlbumJunctionDAO',
        ],

        properties: [
          {
            class: 'foam.dao.DAOProperty',
            name: 'artistDAO',
            factory: function() {
              return this.EasyDAO.create({
                name: 'artistDAO',
                of: this.Artist,
                daoType: 'ARRAY',
              });
            },
          },
          {
            class: 'foam.dao.DAOProperty',
            name: 'albumDAO',
            factory: function() {
              return this.EasyDAO.create({
                name: 'albumDAO',
                of: this.Album,
                daoType: 'ARRAY',
              });
            },
          },
          {
            class: 'foam.dao.DAOProperty',
            name: 'artistAlbumJunctionDAO',
            factory: function() {
              return this.EasyDAO.create({
                name: 'artistAlbumJunctionDAO',
                of: this.ArtistAlbumJunction,
                daoType: 'ARRAY',
              });
            },
          },
        ],
      });
      testCtx = foam.lookup('foam.dao.test.Controller')
        .create().__subContext__;
      Artist = foam.lookup('foam.dao.test.left.Artist');
      Album = foam.lookup('foam.dao.test.right.Album');
      ArtistAlbumJunction = foam.lookup('foam.dao.test.ArtistAlbumJunction');

      adam = Artist.create({ firstName: 'Adam', lastName: 'Adamson' },
                               testCtx);
      eve  = Artist.create({ firstName: 'Eve',  lastName: 'Evanson' },
                               testCtx);
      inTheBeginning = Album.create({
        title: 'In the Beginning',
        releaseYear: 0
      }, testCtx);
      eden = Album.create({
        title: 'Eden',
        releaseYear: 0
      }, testCtx);
      temptation = Album.create({
        title: 'Temptation',
        releaseYear: 1
      }, testCtx);

      Promise.all([
        testCtx.artistDAO.put(adam),
        testCtx.artistDAO.put(eve),
        testCtx.albumDAO.put(inTheBeginning),
        testCtx.albumDAO.put(eden),
        testCtx.albumDAO.put(temptation),
        relate(adam, inTheBeginning),
        relate(adam, eden),
        relate(eve, eden),
        relate(eve, temptation),
        testCtx.artistDAO.find(adam.id).then(function(found) {
          adam = found;
        }),
        testCtx.artistDAO.find(eve.id).then(function(found) {
          eve = found;
        }),
        testCtx.albumDAO.find(inTheBeginning.id).then(function(found) {
          inTheBeginning = found;
        }),
        testCtx.albumDAO.find(eden.id).then(function(found) {
          eden = found;
        }),
        testCtx.albumDAO.find(temptation.id).then(function(found) {
          temptation = found;
        }),
      ]).then(done);
    });

    it('should define forward relationship property', function() {
      var RPV = foam.lookup('foam.dao.RelationshipPropertyValue');
      var DAO = foam.lookup('foam.dao.DAO');
      expect(RPV.isInstance(adam.albums)).toBe(true);
      expect(DAO.isInstance(adam.albums.dao)).toBe(true);
      expect(DAO.isInstance(adam.albums.junctionDAO)).toBe(true);
      expect(DAO.isInstance(adam.albums.targetDAO)).toBe(true);
    });

    it('should define forward relationship property', function() {
      var RPV = foam.lookup('foam.dao.RelationshipPropertyValue');
      var DAO = foam.lookup('foam.dao.DAO');
      expect(RPV.isInstance(eden.artists)).toBe(true);
      expect(DAO.isInstance(eden.artists.dao)).toBe(true);
      expect(DAO.isInstance(eden.artists.junctionDAO)).toBe(true);
      expect(DAO.isInstance(eden.artists.targetDAO)).toBe(true);
    });

    it('should expose all items in .junctionDAO', function(done) {
      var junctions = [
        mkJunction(adam, inTheBeginning),
        mkJunction(adam, eden),
        mkJunction(eve, eden),
        mkJunction(eve, temptation)
      ];
      Promise.all([
        adam.albums.junctionDAO.select().then(function(sink) {
          expect(sortedEquals(sink.a, junctions)).toBe(true);
        }),
        inTheBeginning.artists.junctionDAO.select().then(function(sink) {
          expect(sortedEquals(sink.a, junctions)).toBe(true);
        })
      ]).then(done, done.fail);
    });

    it('should expose all items in .targetDAO', function(done) {
      Promise.all([
        adam.albums.targetDAO.select().then(function(sink) {
          expect(sortedEquals(sink.a, [ inTheBeginning, eden, temptation ]))
            .toBe(true);
        }),
        inTheBeginning.artists.targetDAO.select().then(function(sink) {
          expect(sortedEquals(sink.a, [ adam, eve ])).toBe(true);
        })
      ]).then(done, done.fail);
    });

    it('should expose related items on .dao', function(done) {
      Promise.all([
        adam.albums.dao.select().then(function(sink) {
          expect(sortedEquals(sink.a, [ inTheBeginning, eden ])).toBe(true);
        }),
        eve.albums.dao.select().then(function(sink) {
          expect(sortedEquals(sink.a, [ eden, temptation ])).toBe(true);
        }),
        inTheBeginning.artists.dao.select().then(function(sink) {
          expect(sortedEquals(sink.a, [ adam ])).toBe(true);
        }),
        eden.artists.dao.select().then(function(sink) {
          expect(sortedEquals(sink.a, [ adam, eve ])).toBe(true);
        }),
        temptation.artists.dao.select().then(function(sink) {
          expect(sortedEquals(sink.a, [ eve ])).toBe(true);
        })
      ]).then(done, done.fail);
    });

    it('should relate items with .add()', function(done) {
      Promise.all([
        adam.albums.add(temptation).then(function() {
          return adam.albums.dao.select();
        }).then(function(sink) {
          expect(sortedEquals(sink.a, [ inTheBeginning, eden, temptation ]))
            .toBe(true);
        }),
        inTheBeginning.artists.add(eve).then(function() {
          return inTheBeginning.artists.dao.select();
        }).then(function(sink) {
          expect(sortedEquals(sink.a, [ adam, eve ]))
            .toBe(true);
        })
      ]).then(done, done.fail);
    });

    it('should dissociate items with .remove()', function(done) {
      Promise.all([
        adam.albums.remove(inTheBeginning).then(function() {
          return adam.albums.dao.select();
        }).then(function(sink) {
          expect(sortedEquals(sink.a, [ eden ]))
            .toBe(true);
        }),
        eden.artists.remove(eve).then(function() {
          return eden.artists.dao.select();
        }).then(function(sink) {
          expect(sortedEquals(sink.a, [ adam ]))
            .toBe(true);
        })
      ]).then(done, done.fail);
    });

    it('should supported filtered .dao.find()', function(done) {
      Promise.all([
        adam.albums.dao.find(inTheBeginning).then(function(found) {
          expect(found).not.toBeNull();
        }),
        eve.albums.dao.find(inTheBeginning).then(function(found) {
          expect(found).toBeNull();
        }),
        eve.albums.dao.find(eden.id).then(function(found) {
          expect(found).not.toBeNull();
        }),
        adam.albums.dao.find(temptation.id).then(function(found) {
          expect(found).toBeNull();
        }),
        inTheBeginning.artists.dao.find(adam).then(function(found) {
          expect(found).not.toBeNull();
        }),
        temptation.artists.dao.find(adam).then(function(found) {
          expect(found).toBeNull();
        }),
        eden.artists.dao.find(eve.id).then(function(found) {
          expect(found).not.toBeNull();
        }),
        inTheBeginning.artists.dao.find(eve.id).then(function(found) {
          expect(found).toBeNull();
        })
      ]).then(done, done.fail);
    });
  });
});
