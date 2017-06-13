/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

var env = require('process').env;

describe('DatastoreDAO', function() {
  var clearCDS = com.google.cloud.datastore.clear;
  function daoFactory(cls, opt_ctx) {
    return clearCDS().then(function() {
      return foam.lookup('com.google.cloud.datastore.DatastoreDAO')
          .create({
            of: cls,
            protocol: env.CDS_EMULATOR_PROTOCOL,
            host: env.CDS_EMULATOR_HOST,
            port: env.CDS_EMULATOR_PORT,
            projectId: env.CDS_PROJECT_ID
          }, opt_ctx);
    });
  }

  // From helpers/generic_dao.js.
  global.genericDAOTestBattery(daoFactory);

  describe('construction', function() {
    it('should support "gcloudProjectId" from context', function() {
      var dao = foam.lookup('com.google.cloud.datastore.DatastoreDAO')
          .create({
            of: foam.core.FObject,
            protocol: env.CDS_EMULATOR_PROTOCOL,
            host: env.CDS_EMULATOR_HOST,
            port: env.CDS_EMULATOR_PORT,
          }, foam.__context__.createSubContext({
            gcloudProjectId: env.CDS_PROJECT_ID
          }));
      expect(dao.gcloudProjectId).toBe(env.CDS_PROJECT_ID);
      expect(dao.projectId).toBe(env.CDS_PROJECT_ID);
    });
    it('should throw when no project id is given', function() {
      expect(function() {
        return foam.lookup('com.google.cloud.datastore.DatastoreDAO')
            .create({
              of: foam.core.FObject,
              protocol: env.CDS_EMULATOR_PROTOCOL,
              host: env.CDS_EMULATOR_HOST,
              port: env.CDS_EMULATOR_PORT,
            }).projectId;
      }).toThrow();
    });
  });

  describe('multi-part id', function() {
    var Person;
    beforeEach(function() {
      foam.CLASS({
        package: 'test.dao.mpid',
        name: 'Person',

        ids: [ 'firstName', 'lastName', 'dob' ],

        properties: [
          {
            class: 'String',
            name: 'firstName'
          },
          {
            class: 'String',
            name: 'lastName'
          },
          {
            class: 'Date',
            name: 'dob'
          }
        ]
      });
      Person = foam.lookup('test.dao.mpid.Person');
    });

    it('should handle a multi-part-id put(obj) + lookup(obj)', function(done) {
      daoFactory(Person).then(function(dao) {
        var putPerson = Person.create({
          firstName: 'Born',
          lastName: 'JustNow',
          dob: Date.now()
        });
        dao.put(putPerson).then(function() {
          return dao.find(putPerson);
        }).then(function(gotPerson) {
          expect(gotPerson).toBeDefined();
          expect(foam.util.equals(putPerson, gotPerson)).toBe(true);
          done();
        });
      });
    });

    it(`should throw on lookup( <array-from-multi-part-id > );
        could break inversion of control for multi-part ids`, function(done) {
      daoFactory(Person).then(function(dao) {
        var putPerson = Person.create({
          firstName: 'Born',
          lastName: 'JustNow',
          dob: Date.now()
        });
        dao.put(putPerson).then(function() {
          return dao.find(putPerson.id);
        }).then(function(gotPerson) {
          fail(`find( <multi-part-id> ) = find( <array-of-parts> ) should throw;
                passing the array could break inversion of control for
                multi-part ids`);
        }).catch(done);
      });
    });
  });

  describe('batching', function() {
    // Emulator will batch every 300 records.
    var numRecords = 1000;
    var dao;

    beforeEach(function() {
      // Classes for tracking selectNextBatch_() and items to put() to DAO.
      // Note: A JasmineJS spy on selectNextBatch_() doesn't work becuase
      // FObjects do not have methods as own properties.
      foam.CLASS({
        package: 'test.dao.batch',
        name: 'DatastoreDAO',
        extends: 'com.google.cloud.datastore.DatastoreDAO',

        properties: [
          {
            class: 'Boolean',
            name: 'handledMultipleBatches'
          }
        ],

        methods: [
          function selectNextBatch_() {
            this.handledMultipleBatches = true;
            return this.SUPER.apply(this, arguments);
          }
        ]
      });

      foam.CLASS({
        package: 'test.dao.batch',
        name: 'BatchedItem',

        properties: [
          {
            class: 'String',
            name: 'id'
          }
        ]
      });
    });

    function initDAO() {
      return clearCDS().then(function() {
        var BatchedItem = foam.lookup('test.dao.batch.BatchedItem');
        dao = foam.lookup('test.dao.batch.DatastoreDAO')
            .create({
              of: BatchedItem,
              protocol: env.CDS_EMULATOR_PROTOCOL,
              host: env.CDS_EMULATOR_HOST,
              port: env.CDS_EMULATOR_PORT,
              projectId: env.CDS_PROJECT_ID
            });
        var promises = [];
        for ( var i = 0; i < 1000; i++ ) {
          promises.push(dao.put(BatchedItem.create({
            id: (i).toString()
          })));
        }
        return Promise.all(promises);
      });
    }

    it('should fetch multiple batches for a full result set', function(done) {
      initDAO().then(function() {
        dao.select().then(function(sink) {
          expect(sink.array.length).toBe(numRecords);
          expect(dao.handledMultipleBatches).toBe(true);
          done();
        });
      });
    });
  });

  describe('count', function() {
    foam.CLASS({
      package: 'com.google.cloud.datastore.count',
      name: 'DatastoreDAO',
      extends: 'com.google.cloud.datastore.DatastoreDAO',

      properties: [
        {
          class: 'Boolean',
          name: 'handledMultipleBatches'
        }
      ],

      methods: [
        function getRequest(op, payload) {
          var data = JSON.parse(payload);

          // Skip non-select() requests.
          if ( ! data.query ) return this.SUPER.apply(this, arguments);

          expect(data.query.projection).toEqual([ { property: {name: "__key__" } } ]);
          return this.SUPER.apply(this, arguments);
        },
        function selectNextBatch_() {
          this.handledMultipleBatches = true;
          return this.SUPER.apply(this, arguments);
        }
      ]
    });
    function daoFactory(cls) {
      return clearCDS().then(function() {
        return foam.lookup('com.google.cloud.datastore.count.DatastoreDAO')
            .create({
              of: cls,
              protocol: env.CDS_EMULATOR_PROTOCOL,
              host: env.CDS_EMULATOR_HOST,
              port: env.CDS_EMULATOR_PORT,
              projectId: env.CDS_PROJECT_ID
            });
      });
    }

    var E;
    var Sheep;
    beforeEach(function() {
      var sheepNum = 1;
      foam.CLASS({
        package: 'test.dao.count',
        name: 'Sheep',

        properties: [
          {
            class: 'Int',
            name: 'id',
            factory: function() { return sheepNum++; }
          }
        ]
      });
      Sheep = foam.lookup('test.dao.count.Sheep');
      E = foam.lookup('foam.mlang.ExpressionsSingleton').create();
    });
    it('should perform key-only queries over multiple batches', function(done) {
      var expectedCount = 1000;
      daoFactory(Sheep).then(function(dao) {
        var promises = [];
        for ( var i = 0; i < expectedCount; i++ ) {
          promises.push(dao.put(Sheep.create()));
        }
        return Promise.all(promises).then(function() {
          return dao.select(E.COUNT());
        }).then(function() {
          expect(dao.handledMultipleBatches).toBe(true);
        }).then(done, done.fail);
      });
    });
  });

  describe('context', function() {
    it('should create objects in DAO context', function(done) {
      var ID = 'alpha';
      var MSG = 'Defined in DAO context';
      var ctx = foam.__context__.createSubContext({
        datastoreTestInformation: MSG
      });
      foam.CLASS({
        package: 'test.dao.import',
        name: 'InfoImporter',
        imports: [ 'datastoreTestInformation' ],

        properties: [ { class: 'String', name: 'id' } ]
      });
      var InfoImporter = foam.lookup('test.dao.import.InfoImporter');
      var alphaPut = InfoImporter.create({ id: ID }, ctx);
      daoFactory(InfoImporter, ctx).then(function(dao) {
        return dao.put(alphaPut)
            .then(function() { return dao.find(ID); })
            .then(function(alphaFind) {
              // Find should yield new object created in context that contains
              // imported string.
              expect(alphaFind.datastoreTestInformation).toBe(MSG);
              expect(alphaFind).not.toBe(alphaPut);
              done();
            }).catch(done.fail);
      });
    });
  });

  function unreliableDAOFactory(cls) {
    return clearCDS().then(function() {
      return foam.lookup('com.google.cloud.datastore.DatastoreDAO')
          .create({
            of: cls,
            protocol: env.UNRELIABLE_CDS_EMULATOR_PROTOCOL,
            host: env.UNRELIABLE_CDS_EMULATOR_HOST,
            port: env.UNRELIABLE_CDS_EMULATOR_PORT,
            projectId: env.CDS_PROJECT_ID
          });
    });
  }
  describe('unreliable server', function() {
    beforeEach(function() {
      foam.CLASS({
        package: 'test.dao.unreliable',
        name: 'Place',

        properties: [
          {
            class: 'String',
            name: 'id'
          },
          {
            class: 'Float',
            name: 'long'
          },
          {
            class: 'Float',
            name: 'lat'
          },
        ]
      });
    });

    var mkCentre = function() {
      return test.dao.unreliable.Place.create({
        id: 'centre:0:0',
        name: 'Centre',
        long: 0.0,
        lat: 0.0
      });
    };

    describe('put()', function() {
      it('should reject promise', function() {
        unreliableDAOFactory(test.dao.unreliable.Place).then(function(dao) {
          dao.put(mkCentre()).then(function() {
            fail('put() should fail on unreliable DAO');
          }).catch(function() {
            expect(1).toBe(1);
          });
        });
      });
    });

    describe('find()', function() {
      it('should reject promise',  function() {
        unreliableDAOFactory(test.dao.unreliable.Place).then(function(dao) {
          dao.find('centre:0:0').then(function() {
            fail('find() should fail on unreliable DAO');
          }).catch(function() {
            expect(1).toBe(1);
          });
        });
      });
    });
  });
});
