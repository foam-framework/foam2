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
      name: 'put'
    },
    {
      name: 'remove'
    },
    {
      name: 'find'
    },
    {
      name: 'select'
    },
    {
      name: 'removeAll'
    },
    {
      name: 'listen'
    },
    {
      name: 'unlisten'
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
  name: 'DAOOptions',

  requires: [
    'foam.mlang.AndExpr'
  ],

  properties: [
    {
      class: 'Int',
      name: 'skip'
    },
    {
      class: 'Int',
      name: 'limit'
    },
    'orderBy',
    'where'
  ],

  methods: [
    function addSkip(s) {
      var o = this.cls_.create(this);
      o.skip = s;
      return o;
    },
    function addLimit(l) {
      var o = this.cls_.create(this);
      o.limit = this.hasOwnProperty('limit') ?
        Math.min(l, this.limit) : l;
      return o;
    },
    function addOrderBy(o) {
      var o = this.cls_.create(this);
      o.orderBy = o;
      return o;
    },
    function addWhere(p) {
      var o = this.cls_.create(this);
      o.where = this.where ?
        this.AndExpr.create({ args: [this.where, p] }) :
        p;
      return o;
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
      defaultValue: 0
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
      defaultValue: 0
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
      this.arr.sort(this.comparator);
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
    'foam.promise.Promise',
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

  properties: ['of'],

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

    function listen(sink, options) {},

    function unlisten(sink) {},

    function pipe() {},

    function update() {},

    function decorateSink_(sink, options, isListener, disableLimit) {
      if ( options ) {
        if ( ! disableLimit ) {
          if ( options.hasOwnProperty('limit') )
            sink = this.LimitedSink.create({
              limit: options.limit,
              delegate: sink
            });

          if ( options.hasOwnProperty('skip') )
            sink = this.SkipSink.create({
              skip: options.skip,
              delegate: sink
            });
        }

        if ( options.orderBy && ! isListener )
          sink = this.OrderedSink.create({
            order: options.orderBy,
            delegate: sink
          });

        if ( options.where )
          sink = this.PredicatedSink.create({
            predicate: options.where.partialEval ?
              options.where.partialEval() :
              options.where,
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

  requires: [ 'foam.dao.DAOOptions' ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      delegates: [ 'where', 'orderBy', 'skip', 'limit' ]
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'FilteredDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'predicate'
    }
  ],

  methods: [
    function select(sink, options) {
      options = ( options || this.DAOOptions.create() ).addWhere(this.predicate);
      return this.delegate.select(sink, options);
    },

    function removeAll(sink, options) {
      options = ( options || this.DAOOptions.create() ).addWhere(this.predicate);
      return this.delegate.removeAll(sink, options);
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
    function select(sink, options) {
      options = ( options || this.DAOOptions.create() ).addOrderBy(this.comparator);
      return this.delegate.select(sink, options);
    },
    function removeAll(sink, options) {
      options = ( options || this.DAOOptions.create() ).addOrderBy(this.comparator);
      return this.delegate.removeAll(sink, options);
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
    function select(sink, options) {
      options = ( options || this.DAOOptions.create() ).addSkip(this.skip_);
      return this.delegate.select(sink, options);
    },
    function removeAll(sink, options) {
      options = ( options || this.DAOOptions.create() ).addSkip(this.skip_);
      return this.delegate.removeAll(sink, options);
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
    function select(sink, options) {
      options = ( options || this.DAOOptions.create() ).addLimit(this.limit_);
      return this.delegate.select(sink, options);
    },

    function removeAll(sink, options) {
      options = ( options || this.DAOOptions.create() ).addLimit(this.limit_);
      return this.delegate.removeAll(sink, options);
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
    },
    function eof() {
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ArrayDAO',
  extends: 'foam.dao.AbstractDAO',
  requires: [
    'foam.dao.ArraySink',
  ],

  properties: [
    {
      name: 'array',
      factory: function() { return []; }
    }
  ],

  methods: [
    /** extracts .id */
    function idF_(obj) { return obj && obj.id; },

    function identity_(obj) { return obj; },

    function listen(sink, options) {
    },

    function put(obj, sink) {
      sink = sink || this.Promise.create();
      var promise = this.Promise.create();
      promise.fulfill(sink);

      var f = obj.id ? this.idF_ : this.identity_;
      var id = f(obj);

      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(id, f(this.array[i])) ) {
          this.array[i] = obj;
          break;
        }
      }

      if ( i == this.array.length ) this.array.push(obj);
      sink.put(obj);
      this.on.put.publish(obj);

      return promise;
    },

    function remove(obj, sink) {
      sink = sink || this.Promise.create();
      var promise = this.Promise.create();
      promise.fulfill(sink);

      //var id = obj.id ? obj.id : obj;
      var f = ( obj.id ? this.idF_ : this.identity_ );
      var id = f(obj);

      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(id, f(this.array[i])) ) {
          var o2 = this.array.splice(i, 1)[0];
          sink.remove(o2);
          this.on.remove.publish(o2);
          return promise;
        }
      }

      var err = this.ObjectNotFoundException.create({ id: id });
      sink.error(err);
      return promise;
    },

    function select(sink, options) {
      var resultSink = sink || this.ArraySink.create();

      sink = this.decorateSink_(resultSink, options);

      var promise = this.Promise.create();

      var fc = this.FlowControl.create();
      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( fc.stopped ) break;
        if ( fc.errorEvt ) {
          sink.error(fc.errorEvt);
          promise.reject(fc.errorEvt);
          return promise;
        }

        sink.put(this.array[i], null, fc);
      }

      sink.eof();

      promise.fulfill(resultSink);
      return promise;
    },

    function removeAll(sink, options) {
      // TODO: Require TrueExpr when ordering is fixed or we have
      // better lazy loading
      var predicate = ( options && options.where ) || foam.mlang.TrueExpr.create();

      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( predicate.f(this.array[i]) ) {
          var obj = this.array.splice(i, 1);
          i--;
          sink && sink.remove(obj);
          this.on.remove.publish(obj);
        }
      }

      sink && sink.eof();

      var promise = this.Promise.create();
      promise.fulfill(sink || '');

      return promise;
    },

    function find(id) {
      var promise = this.Promise.create();

      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(id, this.array[i].id) ) {
          promise.fulfill(this.array[i]);
          return promise;
        }
      }

      promise.reject(this.ObjectNotFoundException.create({ id: id }));
      return promise;
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

      this.on.put.subscribe(this.updated);
      this.on.remove.subscribe(this.updated);

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


/*
TODO:
-mlangs
-Context oriented?

questions:
-listen/unlisten using Topics ?
-promises vs sinks
  Sinks make chaining easier dao1.put(obj, dao2);
  Promises more compatible.
-enforcement of interfaces
-anonymous sinks?
-removeAll still takes a sink?

*/
