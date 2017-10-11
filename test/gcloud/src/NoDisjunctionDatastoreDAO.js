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

var env = require('process').env;

describe('NoDisjunction(Datastore) DAO', function() {
  var clearCDS = com.google.cloud.datastore.clear;
  function daoFactory(cls, opt_ctx) {
    return clearCDS().then(function() {
      return foam.lookup('foam.dao.NoDisjunctionDAO').create({
        delegate: foam.lookup('com.google.cloud.datastore.DatastoreDAO')
          .create({
            of: cls,
            protocol: env.CDS_EMULATOR_PROTOCOL,
            host: env.CDS_EMULATOR_HOST,
            port: env.CDS_EMULATOR_PORT,
            projectId: env.CDS_PROJECT_ID
          }, opt_ctx)
      }, opt_ctx);
    });
  }

  // From helpers/generic_dao.js.
  global.genericDAOTestBattery(daoFactory);

  describe('disjunctive queries', function() {
    var E;
    var Person;
    var dao;
    beforeEach(function(done) {
      E = foam.lookup('foam.mlang.ExpressionsSingleton').create();
      foam.CLASS({
        package: 'test',
        name: 'Person',

        ids: [ 'name', 'sex' ],

        properties: [
          { class: 'String', name: 'name' },
          { class: 'String', name: 'sex' }
        ]
      });
      Person = foam.lookup('test.Person');
      daoFactory(Person).then(function(personDAO) {
        dao = personDAO;
        Promise.all([
          dao.put(Person.create({ name: 'Jamie', sex: 'F' })),
          dao.put(Person.create({ name: 'Jamie', sex: 'M' })),
          dao.put(Person.create({ name: 'Jessica', sex: 'F' })),
          dao.put(Person.create({ name: 'James', sex: 'M' }))
        ]).then(done);
      });
    });

    it('should handle simple disjunction', function(done) {
      dao.where(E.OR(E.EQ(Person.SEX, 'F'), E.EQ(Person.SEX, 'M'))).select()
          .then(function(sink) {
            var array = sink.array;
            // All people.
            expect(array.length).toBe(4);
            // No dups.
            for ( var i = 0; i < array.length; i++ ) {
              for ( var j = i + 1; j < array.length; j++ ) {
                expect(array[i].id).not.toEqual(array[j].id);
              }
            }
            done();
          }, done.fail);
    });

    it('should handle non-top-level disjunction', function(done) {
      dao.where(
          E.AND(E.OR(E.EQ(Person.NAME, 'James'), E.EQ(Person.NAME, 'Jamie')),
                E.EQ(Person.SEX, 'F'))).select()
          .then(function(sink) {
            var array = sink.array;
            expect(array.length).toBe(1);
            expect(array[0].name).toBe('Jamie');
            expect(array[0].sex).toBe('F');
            done();
          }, done.fail);
    });

    it('should handle IN()', function(done) {
      dao.where(
          E.AND(E.IN(Person.NAME, [ 'James', 'Jamie', 'Jessica' ]),
                E.EQ(Person.SEX, 'M'))).select()
          .then(function(sink) {
            var array = sink.array;
            expect(array.length).toBe(2);
            // All males, no dups.
            for ( var i = 0; i < array.length; i++ ) {
              expect(array[i].sex).toBe('M');
              for ( var j = i + 1; j < array.length; j++ ) {
                expect(array[i].id).not.toEqual(array[j].id);
              }
            }
            done();
          }, done.fail);
    });
  });
});
