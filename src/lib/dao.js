/*
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

// TODO: This should probably be in core.
foam.CLASS({
  name: 'MethodArguments',
  refines: 'Method',
  properties: [
    {
      name: 'args'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'Sink',

  methods: [
    {
      name: 'put',
      args: [
        'obj',
        'sink',
        'fc'
      ],
      code: function () {}
    },
    {
      name: 'remove',
      args: [
        'obj',
        'sink',
        'fc'
      ],
      code: function() {}
    },
    {
      name: 'eof',
      args: [],
      code: function() {}
    },
    {
      name: 'error',
      args: [],
      code: function() {}
    },
    {
      name: 'reset',
      args: [],
      code: function() {}
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ProxySink',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.Sink',
      name: 'delegate'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'DAO',

  // documentation: 'DAO Interface',

  methods: [
    {
      name: 'put',
      returns: 'Promise'
    },
    {
      name: 'remove',
      returns: 'Promise'
    },
    {
      name: 'find',
      returns: 'Promise'
    },
    {
      name: 'select',
      returns: 'Promise'
    },
    {
      name: 'removeAll',
      returns: 'Promise'
    },
    {
      name: 'pipe'
    },
    {
      name: 'where'
    },
    {
      name: 'orderBy'
    },
    {
      name: 'skip'
    },
    {
      name: 'limit'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'PredicatedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      name: 'predicate'
    }
  ],

  methods: [
    function put(obj, sink, fc) {
      if ( this.predicate.f(obj) ) this.delegate.put(obj, fc, sink);
    },
    function remove(obj, sink, fc) {
      if ( this.predicate.f(obj) ) this.delegate.remove(obj, fc, sink);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LimitedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      name: 'limit'
    },
    {
      name: 'count',
      class: 'Int',
      value: 0
    }
  ],

  methods: [
    function put(obj, sink, fc) {
      if ( this.count++ >= this.limit && fc ) {
        fc.stop();
      } else {
        this.delegate.put(obj, sink, fc);
      }
    },

    function remove(obj, sink, fc) {
      if ( this.count++ >= this.limit && fc ) {
        fc.stop();
      } else {
        this.delegate.remove(obj, s, fc);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'SkipSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      name: 'skip'
    },
    {
      name: 'count',
      class: 'Int',
      value: 0
    }
  ],

  methods: [
    function put(obj, sink, fc) {
      if ( this.count < this.skip ) {
        this.count++;
        return;
      }
      this.delegate.put(obj, sink, fc);
    },

    function remove(obj, sink, fc) {
      if ( this.count < this.skip ) {
        this.count++;
        return;
      }
      this.delegate.remove(obj, sink, fc);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'OrderedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      name: 'comparator'
    },
    {
      name: 'arr',
      factory: function() { return []; }
    }
  ],

  methods: [
    function put(obj, sink, fc) {
      this.arr.push(obj);
    },

    function eof() {
      this.arr.sort(this.comparator.compare || this.comparator);
      for ( var i = 0 ; i < this.arr.length ; i++ ) {
        this.delegate.put(this.arr[i]);
      }
    },

    function remove(obj, sink, fc) {
      // TODO
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'FlowControl',

  properties: [
    'stopped',
    'errorEvt'
  ],

  methods: [
    function stop() { this.stopped = true; },
    function error(e) { this.errorEvt = e; }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Exception',
  properties: [
    'message'
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'InternalException',
  extends: 'Exception'
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ExternalException',
  extends: 'Exception'
})


foam.CLASS({
  package: 'foam.dao',
  name: 'ObjectNotFoundException',
  extends: 'foam.dao.ExternalException',

  properties: [
    'id',
    {
      name: 'message',
      expression: function(id) { return "No record found for id: " + id; }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractDAO',
  implements: ['foam.dao.DAO'],

  requires: [
    'foam.dao.ExternalException',
    'foam.dao.InternalException',
    'foam.dao.ObjectNotFoundException',
    'foam.dao.FlowControl',
    'foam.dao.LimitedSink',
    'foam.dao.SkipSink',
    'foam.dao.OrderedSink',
    'foam.dao.PredicatedSink',
    'foam.dao.FilteredDAO',
    'foam.dao.OrderedDAO',
    'foam.dao.SkipDAO',
    'foam.dao.LimitedDAO'
  ],

  topics: [
    {
      name: 'on',
      topics: [
        'put',
        'remove',
        'reset'
      ]
    }
  ],

  properties: [ 'of' ],

  methods: [
    {
      name: 'where',
      code: function where(p) {
        return this.FilteredDAO.create({
          delegate: this,
          predicate: p
        });
      }
    },

    {
      name: 'orderBy',
      code: function orderBy(o) {
        return this.OrderedDAO.create({
          delegate: this,
          comparator: o
        });
      }
    },

    {
      name: 'skip',
      code: function skip(s) {
        return this.SkipDAO.create({
          delegate: this,
          skip_: s
        });
      }
    },

    {
      name: 'limit',
      code: function limit(l) {
        return this.LimitedDAO.create({
          delegate: this,
          limit_: l
        });
      }
    },

    {
      name: 'pipe',
      code: function pipe(sink, skip, limit, order, predicate) {
        var mySink = this.decorateSink_(sink, skip, limit, order, predicate, true);

        var fc = this.FlowControl.create();
        var sub;

        fc.propertyChange.sub(function(s, _, p) {
          if ( p.name == "stopped") {
            if ( sub ) sub.destroy();
          } else if ( p.name === "errorEvt" ) {
            if ( sub ) sub.destroy();
            mySink.error(fc.errorEvt);
          }
        });

        this.select(sink, skip, limit, order, predicate).then(function() {
          this.on.sub(function(s, on, e, obj) {
            sub = s;
            switch(e) {
            case 'put':
              sink.put(obj, null, fc);
              break;
            case 'remove':
              sink.remove(obj, null, fc);
              break;
            case 'reset':
              sink.reset();
              break;
            }
          });
        }.bind(this));
      }
    },

    function update() {},

    function decorateSink_(sink, skip, limit, order, predicate, isListener, disableLimit) {
      if ( ! disableLimit ) {
        if ( limit !== undefined ) {
          sink = this.LimitedSink.create({
            limit: limit,
            delegate: sink
          });
        }

        if ( skip !== undefined ) {
          sink = this.SkipSink.create({
            skip: skip,
            delegate: sink
          });
        }
      }

      if ( order !== undefined && ! isListener ) {
        sink = this.OrderedSink.create({
          comparator: order,
          delegate: sink
        });
      }

      if ( predicate !== undefined ) {
        sink = this.PredicatedSink.create({
          predicate: predicate.partialEval ?
            predicate.partialEval() :
            predicate,
          delegate: sink
        });
      }

      return sink;
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ProxyDAO',
  extends: 'foam.dao.AbstractDAO',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      delegates: [ 'where', 'orderBy', 'skip', 'limit' ],
      postSet: function(old, nu) {
        if ( old ) old.on.unsub(this.onEvent);
        if ( nu ) nu.on.sub(this.onEvent);

        if ( old && nu ) this.on.reset.pub();
      }
    }
  ],
  listeners: [
    {
      name: 'onEvent',
      code: function(s, a, b, c, d, e, f, g) {
        // TODO: There should be a standard method for doing this
        // that will keep up with the maximum amount of supported pub arguments.
        this.pub(a, b, c, d, e, f, g);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'FilteredDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.mlang.predicate.And'
  ],

  properties: [
    {
      name: 'predicate'
    }
  ],

  methods: [
    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(
        sink, skip, limit, order,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    },

    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(
        skip, limit, order,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'OrderedDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'comparator'
    }
  ],

  methods: [
    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(sink, skip, limit, this.comparator, predicate);
    },
    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(skip, limit, this.comparator, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'SkipDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'skip_'
    }
  ],

  methods: [
    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(sink, this.skip_, limit, order, predicate);
    },
    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(this.skip_, limit, order, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LimitedDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'limit_'
    }
  ],

  methods: [
    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(
        sink, skip,
        limit !== undefined ? Math.min(this.limit_, limit) : this.limit_,
        order, predicate);
    },

    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(
        skip,
        limit !== undefined ? Math.min(this.limit_, limit) : this.limit_,
        order, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ArraySink',
  implements: ['foam.dao.Sink'],

  properties: [
    {
      name: 'a',
      factory: function() { return []; }
    }
  ],

  methods: [
    function put(o) {
      this.a.push(o);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ArrayDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.predicate.True'
  ],

  properties: [
    {
      name: 'array',
      factory: function() { return []; }
    }
  ],

  methods: [
    function put(obj) {
      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(obj.id, this.array[i].id) ) {
          this.array[i] = obj;
          break;
        }
      }

      if ( i == this.array.length ) this.array.push(obj);
      this.on.put.pub(obj);

      return Promise.resolve(obj);
    },

    function remove(obj) {
      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(obj.id, this.array[i].id) ) {
          var o2 = this.array.splice(i, 1)[0];
          this.on.remove.pub(o2);
          break;
        }
      }

      return Promise.resolve();
    },

    function select(sink, skip, limit, order, predicate) {
      var resultSink = sink || this.ArraySink.create();

      sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

      var fc = this.FlowControl.create();
      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( fc.stopped ) break;
        if ( fc.errorEvt ) {
          sink.error(fc.errorEvt);
          return Promise.reject(fc.errorEvt);
        }

        sink.put(this.array[i], null, fc);
      }

      sink.eof();

      return Promise.resolve(resultSink);
    },

    function removeAll(skip, limit, order, predicate) {
      predicate = predicate || this.True.create();

      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( predicate.f(this.array[i]) ) {
          var obj = this.array.splice(i, 1)[0];
          i--;
          this.on.remove.pub(obj);
        }
      }

      return Promise.resolve();
    },

    function find(id) {
      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(id, this.array[i].id) ) {
          return Promise.resolve(this.array[i]);
        }
      }

      return Promise.reject(this.ObjectNotFoundException.create({ id: id }));
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'PromiseDAO',

  extends: 'foam.dao.AbstractDAO',
  imports: ['error'],

  properties: [
    {
      class: 'StateMachine',
      of: 'foam.dao.DAO',
      name: 'state',
      plural: 'states',
      states: [
        {
          name: 'pending',
          className: 'Pending'
        },
        {
          name: 'fulfilled',
          className: 'foam.dao.ProxyDAO'
        }
      ]
    },
    {
      name: 'delegate',
      postSet: function(old, nu) {
        // TODO: This should probably be inherited from ProxyDAO propertly.
        if ( old ) old.on.unsub(this.onEvent);
        if ( nu ) nu.on.sub(this.onEvent);
        if ( old && nu ) this.on.reset.pub();
      }
    },
    {
      name: 'promise',
      final: true,
      postSet: function(_, p) {
        p.then(function(dao) {
          this.delegate = dao;
          this.state = this.STATES.FULFILLED;
        }.bind(this), function(error) {
          this.error("Promise didn't resolve to a DAO", error);
        }.bind(this));
      }
    }
  ],

  classes: [
    {
      name: 'Pending',
      extends: 'foam.dao.AbstractDAO',

      methods: [
        function put(obj) {
          return this.promise.then(function(p) {
            return p.put(obj);
          });
        },
        function remove(obj) {
          return this.promise.then(function(p) {
            return p.remove(obj);
          });
        },
        function select(sink, skip, limit, order, predicate) {
          return this.promise.then(function(p) {
            return p.select(sink, skip, limit, order, predicate);
          });
        },
        function removeAll(skip, limit, order, predicate) {
          return this.promise.then(function(p) {
            return p.removeAll(skip, limit, order, predicate);
          });
        }
      ]
    }
  ],
  listeners: [
    {
      name: 'onEvent',
      code: function(s, a, b, c, d, e, f, g) {
        // TODO: There should be a standard method for doing this
        // that will keep up with the maximum amount of supported pub arguments.
        this.pub(a, b, c, d, e, f, g);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LocalStorageDAO',
  extends: 'foam.dao.ArrayDAO',

  properties: [
    {
      name:  'name',
      label: 'Store Name',
      class:  'foam.core.String',
    }
  ],

  methods: [
    function init() {
      var objs = localStorage.getItem(this.name);
      if ( objs ) this.array = foam.json.parseArray(foam.json.parseString(objs));

      this.on.put.sub(this.updated);
      this.on.remove.sub(this.updated);

      // TODO: base on an indexed DAO
    }
  ],

  listeners: [
    {
      name: 'updated',
      isMerged: 100,
      code: function() {
        localStorage.setItem(this.name, foam.json.stringify(this.array));
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'SyncDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.mlang.Expressions'
  ],
  properties: [
    {
      name: 'remoteDAO',
      transient: true,
      required: true,
      postSet: function(old, nu) {
        if ( old ) old.on.unsub(this.onRemoteUpdate);
        if ( nu ) nu.on.sub(this.onRemoteUpdate);
      }
    },
    {
      name: 'syncRecordDAO',
      transient: true,
      required: true
    },
    {
      name: 'syncProperty',
      required: true,
      transient: true
    },
    {
      name: 'of',
      required: true,
      transient: true
    },
    {
      name: 'E',
      factory: function() { return this.Expressions.create(); }
    }
  ],
  classes: [
    {
      name: 'SyncRecord',
      properties: [
        'id',
        {
          class: 'Int',
          name: 'syncNo',
          value: -1
        },
        {
          class: 'Boolean',
          name: 'deleted',
          value: false
        }
      ]
    }
  ],
  listeners: [
    function onRemoteUpdate(s, on, event, obj) {
      if ( event == 'put' ) {
        this.processFromServer(obj);
      } else if ( event === 'remove' ) {
        this.delegate.remove(obj);
      } else if ( event === 'reset' ) {
        this.delegate.removeAll();
      }
    },
    {
      name: 'onLocalUpdate',
      isMerged: 100,
      code: function() {
        this.sync();
      }
    }
  ],
  methods: [
    function init() {
      this.delegate.on.sub(this.onLocalUpdate);
    },
    function put(obj) {
      return this.delegate.put(obj).then(function(o) {
        this.syncRecordDAO.put(
          this.SyncRecord.create({
            id: o.id,
            syncNo: -1
          }));
        return o;
      }.bind(this));
    },
    function remove(obj) {
      return this.delegate.remove(obj).then(function(o) {
        this.syncRecordDAO.put(
          this.SyncRecord.create({
            id: obj.id,
            deleted: true,
            syncNo: -1
          }));
      }.bind(this));
    },
    function removeAll(skip, limit, order, predicate) {
      this.delegate.select(null, skip, limit, order, predicate).then(function(a) {
        a = a.a;
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.remove(a[i]);
        }
      }.bind(this));
    },
    function processFromServer(obj) {
      this.delegate.put(obj).then(function(obj) {
        this.syncRecordDAO.put(
          this.SyncRecord.create({
            id: obj.id,
            syncNo: obj[this.syncProperty.name]
          }));
      }.bind(this));
    },
    function syncFromServer() {
      var E = this.E;

      this.syncRecordDAO.select(E.MAX(this.SyncRecord.SYNC_NO)).then(function(m) {
        this.remoteDAO
          .where(
            E.GT(this.syncProperty, m.value))
          .select().then(function(a) {
            a = a.a;
            for ( var i = 0 ; i < a.length ; i++ ) {
              this.processFromServer(a[i]);
            }
          }.bind(this));
      }.bind(this));
    },
    function syncToServer() {
      var E = this.E;
      var self = this;

      this.syncRecordDAO
        .where(E.EQ(this.SyncRecord.SYNC_NO, -1))
        .select().then(function(records) {
          records = records.a;

          for ( var i = 0 ; i < records.length ; i++ ) {
            var record = records[i]
            var id = record.id;
            var deleted = record.deleted;

            if ( deleted ) {
              var obj = self.of.create();
              obj.id = id;
              self.remoteDAO.remove(obj);
            } else {
              // TODO: Stop sending updates if the first one fails.
              self.delegate.find(id).then(function(obj) {
                return self.remoteDAO.put(obj);
              }).then(function(obj) {
                self.processFromServer(obj);
              });
            }
          }
        });
    },
    function sync() {
      this.syncToServer();
      this.syncFromServer();
    }
  ],
});

/*
TODO:
-Context oriented ?
-enforcement of interfaces
-anonymous sinks ?
-decide on remove(obj) and remove(id) being allowed
*/
