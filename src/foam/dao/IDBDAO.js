/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

/*
TODO:
-verify that multi part keys work properly
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'IDBDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.dao.ArraySink',
    'foam.dao.IDBInternalException',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.Eq'
  ],

  imports: [
    'async'
  ],

  properties: [
    {
      name: 'of',
      required: true
    },
    {
      name:  'name',
      label: 'Store Name',
      factory: function() { return this.of.id; }
    },
    {
      name: 'indicies',
      factory: function() { return []; }
    },
    {
      name: 'version',
      value: 1
    },
    {
      /** The future that holds the open DB. Call this.withDB.then(function(db) { ... }); */
      name: 'withDB',
      factory: function() {
        var self = this;

        return new Promise(function(resolve, reject) {
          var indexedDB = global.indexedDB ||
            global.webkitIndexedDB         ||
            global.mozIndexedDB;

          var request = indexedDB.open("FOAM:" + self.name, self.version);

          request.onupgradeneeded = function(e) {
            var db = e.target.result;

            // FUTURE: Provide migration support here?  Or just have people create a new dao?
            if ( db.objectStoreNames.contains(self.name) ) {
              db.deleteObjectStore(self.name);
            }

            var store = e.target.result.createObjectStore(self.name);
            for ( var i = 0; i < self.indicies.length; i++ ) {
              store.createIndex(
                  self.indicies[i][0],
                  self.indicies[i][0],
                  { unique: self.indicies[i][1] });
            }
          }

          request.onsuccess = function(e) {
            resolve(e.target.result);
          }

          request.onerror = function (e) {
            reject(self.IDBInternalException.create({ id: 'open', error: e }));
          };
        });
      }
    },
  ],

  methods: [
    function deserialize(json) {
      return foam.json.parse(json, this.of, this.__subContext__);
    },

    function serialize(obj) {
      return foam.json.Storage.objectify(obj);
    },
    function serializeId(id) {
      return this.of.ID.toJSON(id);
    },

    function withStore(mode, fn) {
      return this.withStore_(mode, fn);
      if ( mode !== 'readwrite' ) return this.withStore_(mode, fn);

      var self = this;

      if ( ! this.q_ ) {
        var q = [fn];
        this.q_ = q;
        this.async(function() {
          self.withStore_(mode, function(store) {
            // console.log('q length: ', q.length);
            if ( self.q_ == q ) self.q_ = undefined;
            for ( var i = 0 ; i < q.length ; i++ ) q[i](store);
          });
        })();
      } else {
        this.q_.push(fn);
        // Diminishing returns after 10000 per batch
        if ( this.q_.length == 10000 ) this.q_ = undefined;
      }
    },

    function withStore_(mode, fn) {
      // NOTE: Large numbers of insertions can be made
      // faster by keeping the transaction between puts.
      // But due to Promises being async, the transaction
      // is usually closed by the next put.
      var self = this;
      self.withDB.then(function (db) {
        var tx = db.transaction([self.name], mode);
        var os = tx.objectStore(self.name);
        fn.call(self, os);
      });
    },

    function put_(x, value) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var request = store.put(self.serialize(value),
                                  self.serializeId(value.id));
          request.transaction.addEventListener(
            'complete',
            function(e) {
              self.pub('on','put', value);
              resolve(value);
            });
          request.transaction.addEventListener(
            'error',
            function(e) {
              reject(self.IDBInternalException.create({ id: value.id, error: e }));
            });
        });
      });
    },

    function find_(x, obj) {
      var self = this;
      var key  = this.serializeId(obj.id !== undefined ? obj.id : obj);

      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var request = store.get(key);
          request.transaction.addEventListener(
            'complete',
            function() {
              if ( ! request.result ) {
                resolve(null);
                return;
              }
              var result = self.deserialize(request.result);
              resolve(result);
            });
          request.onerror = function(e) {
            reject(self.IDBInternalException.create({ id: key, error: e }));
          };
        });
      });
    },

    function remove_(x, obj) {
      var self = this;
      var key  = this.serializeId(obj.id !== undefined ? obj.id : obj);
      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var getRequest = store.get(key);
          getRequest.onsuccess = function(e) {
            if (!getRequest.result) {
              // not found? as good as removed!
              resolve();
              return;
            }
            var data = self.deserialize(getRequest.result);
            var delRequest = store.delete(key);
            delRequest.transaction.addEventListener('complete', function(e) {
              self.pub('on','remove', data);
              resolve();
            });

            delRequest.onerror = function(e) {
              reject(self.IDBInternalException.create({ id: key, error: e }));
            };
          };
          getRequest.onerror = function(e) {
            reject(self.IDBInternalException.create({ id: key, error: e }));
          };
        });
      });
    },

    function removeAll_(x, skip, limit, order, predicate) {
      var query = predicate || this.True.create();

      var self = this;

      // If the caller doesn't care to see the objects as they get removed,
      // then just nuke them in one go.
      if ( ! predicate && ! self.hasListeners('on', 'remove') ) {
        return new Promise(function(resolve, reject) {
          self.withStore('readwrite', function(store) {
            var req = store.clear();
            req.onsuccess = function() {
              resolve();
            };
            req.onerror = function(e) {
              reject(self.IDBInternalException.create({ id: 'remove_all', error: e }));
            };
          });
        });
      }
      // send items to the sink and remove one by one
      return new Promise(function(resolve, reject) {
        self.withStore('readwrite', function(store) {
          var request = store.openCursor();
          request.onsuccess = function(e) {
            var cursor = e.target.result;
            if (cursor) {
              var value = self.deserialize(cursor.value);
              if (query.f(value)) {
                var deleteReq = cursor.delete();
                deleteReq.addEventListener(
                  'success',
                  function() {
                    self.pub('on','remove', value);
                  });
                deleteReq.onerror = function(e) {
                };
              }
              cursor.continue();
            }
          };
          request.transaction.addEventListener('complete', function() {
            resolve();
          });
          request.onerror = function(e) {
            reject(self.IDBInternalException.create({ id: 'remove_all', error: e }));
          };
        });
      });
    },

    function select_(x, sink, skip, limit, order, predicate) {
      var resultSink = sink || this.ArraySink.create();
      sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

      var sub      = foam.core.FObject.create();
      var detached = false;
      sub.onDetach(function() { detached = true; });

      var self = this;

      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var useIndex = predicate &&
            this.Eq.isInstance(predicate) &&
            store.indexNames.contains(predicate.arg1.name);

          var request = useIndex ?
            store.index(predicate.arg1.name).openCursor(IDBKeyRange.only(predicate.arg2.f())) :
            store.openCursor() ;

          request.onsuccess = function(e) {
            var cursor = e.target.result;
            if ( e.target.error ) {
              reject(e.target.error);
              return;
            }

            if ( ! cursor || detached ) {
              sink.eof && sink.eof();
              resolve(resultSink);
              return;
            }

            var value = self.deserialize(cursor.value);
            sink.put(value, sub);
            cursor.continue();
          };

          request.onerror = function(e) {
            reject(self.IDBInternalException.create({ id: 'select', error: e }));
          };
        });
      });
    },

    function addIndex(prop) {
      this.indicies.push([prop.name, false]);
      return this;
    }
  ]
});
