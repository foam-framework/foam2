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
  function daoFactory(cls) {
    return global.clearCDS().then(function() {
      return foam.lookup('com.google.cloud.datastore.node.DatastoreDAO')
          .create({
            of: cls,
            protocol: env.CDS_EMULATOR_PROTOCOL,
            host: env.CDS_EMULATOR_HOST,
            port: env.CDS_EMULATOR_PORT
          }, foam.__context__.createSubContext({
            projectId: env.CDS_PROJECT_ID
          }));
    });
  }

  // From helpers/generic_dao.js.
  global.genericDAOTestBattery(daoFactory);
});
