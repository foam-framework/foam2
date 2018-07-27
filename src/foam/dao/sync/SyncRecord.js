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

foam.CLASS({
  package: 'foam.dao.sync',
  name: 'SyncRecord',

  documentation: `Used by foam.dao.SyncDAO to track object updates and
      deletions.`,

  properties: [ 'id' ]
});

foam.SCRIPT({
  id: 'foam.dao.sync.VersionedSyncRecordScript',
  requires: [
    'foam.version.VersionedClassFactorySingleton',
    'foam.dao.sync.SyncRecord',
  ],
  code: function() {
// Define foam.dao.sync.VersionedSyncRecord.
foam.lookup('foam.version.VersionedClassFactorySingleton').create().get(
    foam.lookup('foam.dao.sync.SyncRecord'));
  }
});
