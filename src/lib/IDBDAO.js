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

foam.CLASS({
  package: 'foam.dao',
  name: 'IDBDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.dao.FlowControl',
    'foam.dao.ArraySink',
  ],

  imports: [
    'async',
  ],

//   function documentation() {/*
//   Usage:<br/>
//    <code>var dao = IDBDAO.create({model: Issue});<br/>
//    var dao = IDBDAO.create({model: Issue, name: 'ImportantIssues'});<br/></code>
//   <br/>
//    TODO:<br/>
//    Optimization.  This DAO doesn't use any indexes in indexeddb yet, which
//    means for any query other than a single find/remove we iterate the entire
//    data store.  Obviously this will get slow if you store large amounts
//    of data in the database.
//  */},
  properties: [
    {
      name:  'of',
      required: true
    },
    {
      name:  'name',
      label: 'Store Name',
      expression: function() {
        return this.of.id;
      }
    },
    {
      name: 'indicies',
      factory: function() { return []; }
    },
    {
      /** @internal */
      name: 'propKeys_'
    }
  ],

  methods: [

    function init() {

      var propKeys = this.propKeys_ = {};
      var properties = this.of.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < properties.length ; i++ ) {
        var prop = properties[i];
        propKeys[prop.name] = prop.name;
        if ( prop.shortName ) propKeys[prop.shortName] = prop.name;
      }

      //this.withDB = this.openDB;
    },

    function deserialize(json) {
      return foam.json.parse(foam.json.parseString(json)); //TODO: serialization
    },

    function serialize(obj) {
      return foam.json.stringify(obj); //TODO: serialization
    },

    function openDB(cc) {
      var indexedDB = window.indexedDB ||
        window.webkitIndexedDB         ||
        window.mozIndexedDB;

      var request = indexedDB.open("FOAM:" + this.name, 1);
      var self = this;

      request.onupgradeneeded = (function(e) {
        var store = e.target.result.createObjectStore(self.name);
        for ( var i = 0; i < self.indicies.length; i++ ) {
          store.createIndex(self.indicies[i][0], self.indicies[i][0], { unique: self.indicies[i][1] });
        }
      })

      request.onsuccess = (function(e) {
        cc(e.target.result);
      })

      request.onerror = function (e) {
        console.log('************** failure', e);
      };
    },

    function withStore(mode, fn) {
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
        }, this.X)();
      } else {
        this.q_.push(fn);
        // Diminishing returns after 10000 per batch
        if ( this.q_.length == 10000 ) this.q_ = undefined;
      }
    },

    function withStore_(mode, fn) {
      if ( global.__TXN__ && global.__TXN__.store ) {
        try {
          fn.call(this, __TXN__.store);
          return;
        } catch (x) {
          global.__TXN__ = undefined;
        }
      }
      this.openDB((function (db) { // TODO: memoize like in foam1
        var tx = db.transaction([this.name], mode);
        var os = tx.objectStore(this.name);
        if ( global.__TXN__ ) global.__TXN__.store = os;
        fn.call(this, os);
      }).bind(this));
    },

    function put(value, sink) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var request = store.put(self.serialize(value), value.id);
          request.transaction.addEventListener(
            'complete',
            function(e) {
              self.pub('on','put', value);
              sink && sink.put && sink.put(value);
              resolve(sink || value);
            });
          request.transaction.addEventListener(
            'error',
            function(e) {
              sink && sink.error && sink.error('put', value, e); // TODO: err message
              reject(e);
            });
        });
      });
    },

    function find(key) {
      var self = this;

      if ( foam.mlang.predicate.Expr.isInstance(key) ) {
        var found = false;
        return new Promise(function(resolve, reject) {
          self.limit(1).where(key).select({
            put: function(obj) {
              found = true;
              resolve(obj);
            },
            eof: function() {
              if ( ! found ) {
                reject(key); // TODO: err message
              }
            },
          });
        });
      } else {
        return new Promise(function(resolve, reject) {
          self.withStore("readonly", function(store) {
            var request = store.get(key);
            request.transaction.addEventListener(
              'complete',
              function() {
                if (!request.result) {
                  reject(key); // TODO: err message
                  return;
                }
                var result = self.deserialize(request.result);
                resolve(result);
              });
            request.onerror = function(e) {
              // TODO: Parse a better error out of e
              reject(e); // TODO: err message
            };
          });
        });
      }
    },

    function remove(obj, sink) {
      var self = this;
      var key = obj.id != undefined ? obj.id : obj;
      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var getRequest = store.get(key);
          getRequest.onsuccess = function(e) {
            if (!getRequest.result) {
              sink && sink.error && sink.error('remove', obj);
              reject(obj); // TODO: err message
              return;
            }
            var data = self.deserialize(getRequest.result);
            var delRequest = store.delete(key);
            delRequest.transaction.addEventListener('complete', function(e) {
              self.pub('on','remove', data);
              sink && sink.remove && sink.remove(data);
              resolve(sink || data);
            });

            delRequest.onerror = function(e) {
              sink && sink.error && sink.error('remove', e);
              reject(e); // TODO: err message
            };
          };
          getRequest.onerror = function(e) {
            sink && sink.error && sink.error('remove', e);
            reject(e); // TODO: err message
          };
        });
      });
    },

    function removeAll(sink, options) {
      var query = (options && options.query && options.query.partialEval()) ||
        {  f: function() { return true; } };

      var self = this;

      // If the caller doesn't care to see the objects as they get removed,
      // then just nuke them in one go.
      if ( ! options && ! ( sink && sink.remove ) ) {
        return new Promise(function(resolve, reject) {
          self.withStore('readwrite', function(store) {
            var req = store.clear();
            req.onsuccess = function() {
              resolve(sink || '');
            };
            req.onerror = function() {
              reject(arguments);
            };
          });
        });
      } else {
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
                  deleteReq.transaction.addEventListener(
                    'complete',
                    function() {
                      self.pub('on','remove', value);
                      sink && sink.remove && sink.remove(value);
                    });
                  deleteReq.onerror = function(e) {
                    sink && sink.error && sink.error('remove', e);
                  };
                }
                cursor.continue();
              }
            };
            request.transaction.oncomplete = function() {
              sink && sink.eof && sink.eof();
              resolve(sink);
            };
            request.onerror = function(e) {
              sink && sink.error && sink.error('remove', e);
              reject(e); // TODO: err message
            };
          });
        });
      }
    },

    function select(sink, options) {
      sink = sink || this.ArraySink.create();
      sink = this.decorateSink_(sink, options);

      var fc = this.FlowControl.create();
      var self = this;

      return new Promise(function(resolve, reject) {
        self.withStore("readonly", function(store) {
          if ( options && options.query && EqExpr.isInstance(options.query) && store.indexNames.contains(options.query.arg1.name) ) {
            var request = store.index(options.query.arg1.name).openCursor(IDBKeyRange.only(options.query.arg2.f()));
          } else {
            var request = store.openCursor();
          }
          request.onsuccess = function(e) {
            var cursor = e.target.result;
            if ( fc.stopped ) return;
            if ( fc.errorEvt ) {
              sink.error && sink.error(fc.errorEvt);
              reject(fc.errorEvt);
              return;
            }

            if (!cursor) {
              sink.eof && sink.eof();
              resolve(sink);
              return;
            }

            var value = self.deserialize(cursor.value);
            sink.put(value);
            cursor.continue();
          };
          request.onerror = function(e) {
            sink.error && sink.error(e);
            reject(e);  // TODO: err message
          };
        });
      });
    },

    function addIndex(prop) {
      this.indicies.push([prop.name, false]);
      return this;
    }
  ],

});
