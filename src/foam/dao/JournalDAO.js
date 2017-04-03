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
  name: 'JournalEntry',

  documentation: 'Used by JournalDAO to store the state of an object at a specific time.',

  properties: [
    'id',
    {
      /** The object state to store */
      class: 'FObjectProperty',
      name: 'record'
    },
    {
      /** Set true if this record was a removal of the object, not an
        update or add. */
      class: 'Boolean',
      name: 'isRemove',
      value: false
    }
  ]
});

if ( foam.isServer ) {
  foam.CLASS({
    package: 'foam.dao',
    name: 'NodeFileJournal',
    implements: ['foam.dao.Sink'],
    properties: [
      {
        name: 'fd',
        required: true
      },
      {
        name: 'offset',
        factory: function() {
          var stat = this.fs.fstatSync(this.fd);
          return stat.size;
        }
      },
      {
        name: 'fs',
        factory: function() { return require('fs'); }
      }
    ],
    methods: [
      function put(_, obj) {
        this.write_(
          new Buffer("put(foam.json.parse(" +
                     foam.json.Storage.stringify(obj) + "));\n"));
      },
      function remove(_, obj) {
        this.write_(
          new Buffer("remove(foam.json.parse(" +
                     foam.json.Storage.stringify(obj) + "));\n"));
      },
      function write_(data) {
        var offset = this.offset;
        this.offset += data.length;
        this.fs.write(this.fd, data, 0, data.length, offset, function(err, written, buffer){
          if ( written != data.length ) throw "What";
          if ( err ) throw err;
        });
      },
      function replay(dao) {
        var self = this;
        return new Promise(function(resolve, reject) {
          self.fs.readFile(self.fd, 'utf8', function(err, data_) {
            if ( err ) {
              reject(err);
              return;
            }

            with(dao) eval(data_);

            resolve(dao);
          });
        });
      },
      function eof() {}
    ]
  });
}

foam.CLASS({
  package: 'foam.dao',
  name: 'JournaledDAO',
  extends: 'foam.dao.PromisedDAO',
  properties: [
    'delegate',
    'journal',
    {
      name: 'promise',
      factory: function() {
        var self = this;
        return this.journal.replay(this.delegate).then(function(dao) {
          dao.listen(self.journal);
          return dao;
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'JournalDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Saves each addition, update, or removal of objects to the delegate DAO. Previous state for the object is stored, so the journal can replay the object put() and remove() events to recreate the delegate DAO.',

  requires: [
    'foam.dao.JournalEntry'
  ],

  properties: [
    {
      /** The DAO to store the journal entries.
        Note that this must have a TimestampDAO or SequenceNumberDAO to
        apply a unique id to each entry. */
      name: 'journal'
    }
  ],

  methods: [
    function put(obj) {
      return this.delegate.put(obj).then(function(obj) {
        this.journal.put(this.JournalEntry.create({
          record: obj
        }));
        return obj;
      }.bind(this));
    },

    function remove(obj) {
      return this.delegate.remove(obj).then(function(r) {
        this.journal.put(this.JournalEntry.create({
          record: obj,
          isRemove: true
        }));
        return r;
      }.bind(this));
    }
  ]
});
