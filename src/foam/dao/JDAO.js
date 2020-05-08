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

foam.CLASS({
  package: 'foam.dao',
  name: 'JDAO',
  extends: 'foam.dao.PromisedDAO',

  properties: [
    'delegate',
    'journal',
    {
      name: 'promise',
      factory: function() {
        var self = this;
        return this.journal.replay(null, this.delegate).then(function(dao) {
          // TODO: can't use `requires` for class used inside factory
          sink = foam.dao.JournalSink.create({
            journal: self.journal,
            dao: self.delegate,
          });
          dao.listen(sink);
          return dao;
        });
      }
    },
    {
      name: 'synced',
      getter: function() {
        return Promise.all([ this.promise, this.journal.writePromise ]);
      }
    }
  ]
});
