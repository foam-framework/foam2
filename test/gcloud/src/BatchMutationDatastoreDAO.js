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

describe('BatchMutationDatastoreDAO', function() {
  var clearCDS = com.google.cloud.datastore.clear;
  function daoFactory(cls) {
    return clearCDS().then(function() {
      return foam.lookup('com.google.cloud.datastore.BatchMutationDatastoreDAO')
          .create({
            of: cls,
            protocol: env.CDS_EMULATOR_PROTOCOL,
            host: env.CDS_EMULATOR_HOST,
            port: env.CDS_EMULATOR_PORT,
            projectId: env.CDS_PROJECT_ID
          });
    });
  }

  // From helpers/generic_dao.js.
  global.genericDAOTestBattery(daoFactory);

  it('should handle multiple batches', function(done) {
    // Class of things to put into DAO.
    foam.CLASS({
      package: 'com.google.cloud.datastore.test',
      name: 'Thing',

      properties: [ { class: 'Int', name: 'id' } ]
    });
    var Thing = foam.lookup('com.google.cloud.datastore.test.Thing');

    // Class for counting number of batches sent to server.
    //
    // TOOD(markdittmer): This is too tightly coupled to listeners that
    // participate in batch-sending flow in a particular way. It would be better
    // to, for example, override HTTPRequest class and count beginTransaction
    // and commit requets.
    foam.CLASS({
      package: 'com.google.cloud.datastore.test',
      name: 'BatchMutationDatastoreDAO',
      extends: 'com.google.cloud.datastore.BatchMutationDatastoreDAO',

      properties: [
        {
          class: 'Int',
          name: 'batches'
        }
      ],

      listeners: [
        {
          name: 'onBatchedOperation',
          isMerged: true,
          mergeDelay: 150,
          code: function() {
            this.batches++;
            this.SUPER();
          }
        }
      ]
    });

    clearCDS().then(function() {
      var dao = foam.lookup('com.google.cloud.datastore.test.BatchMutationDatastoreDAO')
          .create({
            of: Thing,
            batchSize: 2,
            protocol: env.CDS_EMULATOR_PROTOCOL,
            host: env.CDS_EMULATOR_HOST,
            port: env.CDS_EMULATOR_PORT,
            projectId: env.CDS_PROJECT_ID
          });
      Promise.all([
        dao.put(Thing.create({ id: 1 })),
        dao.put(Thing.create({ id: 2 })),
        dao.put(Thing.create({ id: 3 })),
        dao.put(Thing.create({ id: 4 })),
        dao.put(Thing.create({ id: 5 }))
      ]).then(function() {
        expect(dao.batches).toBe(3);
        done();
      }, done.fail);
    });
  });
});
