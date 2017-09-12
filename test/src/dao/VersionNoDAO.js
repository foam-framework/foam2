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

describe('VersionNoDAO', function() {
  var Person;
  var VersionedPerson;
  var StoreAndForwardDAO;
  var VersionNoDAO;
  var ArrayDAO;
  beforeEach(function() {
    foam.CLASS({
      package: 'foam.dao.test',
      name: 'Person',

      properties: [
        {
          name: 'id',
          getter: function() {
            if ( ! ( this.lastName && this.firstName ) )
              throw new Error('Unnamed person');
            return this.lastName + ', ' + this.firstName;
          }
        },
        {
          class: 'String',
          name: 'firstName'
        },
        {
          class: 'String',
          name: 'lastName'
        }
      ]
    });
    Person = foam.dao.test.Person;
    VersionedPerson = foam.version.VersionedClassFactorySingleton.create().
        get(Person);
    StoreAndForwardDAO = foam.dao.StoreAndForwardDAO;
    VersionNoDAO = foam.dao.VersionNoDAO;
    ArrayDAO = foam.dao.ArrayDAO;
  });

  it('should support remove() when id contains getter', function(done) {
    // TODO(markdittmer): StoreAndForwardDAO should be unnecessary here; make
    // VersionNoDAO a PromiseDAO.
    var dao = StoreAndForwardDAO.create({
      of: VersionedPerson,
      delegate: VersionNoDAO.create({
        of: VersionedPerson,
        delegate: ArrayDAO.create({ of: VersionedPerson })
      })
    });

    dao.put(VersionedPerson.create({
      firstName: 'Aaron',
      lastName: 'Aaronson'
    })).then(function(aaron) {
      dao.remove(aaron);
    }).then(done, done.fail);
  });
});
