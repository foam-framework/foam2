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
  package: 'foam.dao',
  name: 'FlowControl',

  properties: [
    {
      class: 'Boolean',
      name: 'stopped'
    },
    {
      name: 'errorEvt',
      javaType: 'Object',
      javaJsonParser: 'foam.lib.json.AnyParser'
    }
  ],

  methods: [
    {
      name: 'stop',
      code: function() { this.stopped = true; },
      javaCode: 'setStopped(true);'
    },
    {
      name: 'error',
      code: function error(e) { this.errorEvt = e; }
    }
  ]
});


foam.INTERFACE({
  package: 'foam.dao',
  name: 'Sink',

  methods: [
    {
      name: 'put',
      returns: '',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'fc',
          javaType: 'foam.dao.FlowControl'
        }
      ],
      code: function() {}
    },
    {
      name: 'remove',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'fc',
          javaType: 'foam.dao.FlowControl'
        }
      ],
      code: function() {}
    },
    {
      name: 'eof',
      returns: '',
      javaReturns: 'void',
      args: [],
      code: function() {}
    },
    {
      name: 'error',
      returns: '',
      javaReturns: 'void',
      args: [],
      code: function() {}
    },
    {
      name: 'reset',
      returns: '',
      javaReturns: 'void',
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


foam.INTERFACE({
  package: 'foam.dao',
  name: 'DAO',

  // documentation: 'DAO Interface',

  methods: [
    {
      name: 'put',
      returns: 'Promise',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'remove',
      returns: 'Promise',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'find',
      returns: 'Promise',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'id',
          javaType: 'Object'
        }
      ]
    },
    {
      name: 'select',
      returns: 'Promise',
      javaReturns: 'foam.dao.Sink',
      args: [
        {
          name: 'sink',
          javaType: 'foam.dao.Sink'
        }
      ]
    },
    {
      name: 'removeAll',
      returns: '',
      javaReturns: 'void',
      args: []
    },
    {
      name: 'pipe', // TODO: return a promise? don't put pipe and listen here?
      returns: '',
      javaReturns: 'void',
      args: [
        {
          name: 'sink',
          javaType: 'foam.dao.Sink'
        }
      ]
    },
    {
      name: 'where',
      returns: 'foam.dao.DAO',
      javaReturns: 'foam.dao.DAO',
      args: [
        {
          name: 'predicate',
          javaType: 'foam.mlang.predicate.Predicate'
        }
      ]
    },
    {
      name: 'orderBy',
      returns: 'foam.dao.DAO',
      javaReturns: 'foam.dao.DAO',
      args: [
        {
          name: 'comparator',
          javaType: 'foam.mlang.order.Comparator'
        }
      ]
    },
    {
      name: 'skip',
      returns: 'foam.dao.DAO',
      javaReturns: 'foam.dao.DAO',
      args: [
        {
          name: 'count',
          javaType: 'int'
        }
      ]
    },
    {
      name: 'limit',
      returns: 'foam.dao.DAO',
      javaReturns: 'foam.dao.DAO',
      args: [
        {
          name: 'count',
          javaType: 'int'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractSink',

  implements: [ 'foam.dao.Sink' ]

});

foam.CLASS({
  package: 'foam.dao',
  name: 'QuickSink',

  extends: 'foam.dao.AbstractSink',

  properties: [
    {
      class: 'Function',
      name: 'putFn'
    },
    {
      class: 'Function',
      name: 'removeFn'
    },
    {
      class: 'Function',
      name: 'eofFn'
    },
    {
      class: 'Function',
      name: 'errorFn'
    },
    {
      class: 'Function',
      name: 'resetFn'
    },
  ],

  methods: [
    function put() {
      return this.putFn && this.putFn.apply(this, arguments);
    },
    function remove() {
      return this.removeFn && this.removeFn.apply(this, arguments);
    },
    function eof() {
      return this.eofFn && this.eofFn.apply(this, arguments);
    },
    function error() {
      return this.errorFn && this.errorFn.apply(this, arguments);
    },
    function reset() {
      return this.resetFn && this.resetFn.apply(this, arguments);
    },
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
    function put(obj, fc) {
      if ( this.predicate.f(obj) ) this.delegate.put(obj, fc);
    },
    function remove(obj, fc) {
      if ( this.predicate.f(obj) ) this.delegate.remove(obj, fc);
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
    function put(obj, fc) {
      if ( this.count++ >= this.limit && fc ) {
        fc.stop();
      } else {
        this.delegate.put(obj, fc);
      }
    },

    function remove(obj, fc) {
      if ( this.count++ >= this.limit && fc ) {
        fc.stop();
      } else {
        this.delegate.remove(obj, fc);
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
    function put(obj, fc) {
      if ( this.count < this.skip ) {
        this.count++;
        return;
      }
      this.delegate.put(obj, fc);
    },

    function remove(obj, fc) {
      if ( this.count < this.skip ) {
        this.count++;
        return;
      }
      this.delegate.remove(obj, fc);
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
    function put(obj, fc) {
      this.arr.push(obj);
    },

    function eof() {
      this.arr.sort(this.comparator.compare || this.comparator);
      for ( var i = 0 ; i < this.arr.length ; i++ ) {
        this.delegate.put(this.arr[i]);
      }
    },

    function remove(obj, fc) {
      // TODO
    }
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

  properties: [
    {
      class: 'Class2',
      name: 'of'
    }
  ],

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
              sink.put(obj, fc);
              break;
            case 'remove':
              sink.remove(obj, fc);
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
        if ( limit != undefined ) {
          sink = this.LimitedSink.create({
            limit: limit,
            delegate: sink
          });
        }

        if ( skip != undefined ) {
          sink = this.SkipSink.create({
            skip: skip,
            delegate: sink
          });
        }
      }

      if ( order != undefined && ! isListener ) {
        sink = this.OrderedSink.create({
          comparator: order,
          delegate: sink
        });
      }

      if ( predicate != undefined ) {
        sink = this.PredicatedSink.create({
          predicate: predicate.partialEval ?
            predicate.partialEval() :
            predicate,
          delegate: sink
        });
      }

      return sink;
    },

    function eof() {
      // Do nothing by default, but can be overridden.
      // This allows DAOs to be used as a Sink.
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
      topics: [ 'on' ],
      forwards: [ 'put', 'remove', 'find', 'select', 'removeAll' ],
      postSet: function(old, nu) {
        // Only fire a 'reset' when the delegate is actually changing, not being
        // set for the first time.
        if ( old ) {
          this.on.reset.pub();
        }
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

        sink.put(this.array[i], fc);
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
  name: 'PromisedDAO',
  extends: 'foam.dao.AbstractDAO',

  properties: [
    {
      class: 'Promised',
      of: 'foam.dao.DAO',
      methods: [ 'put', 'remove', 'find', 'select', 'removeAll' ],
      topics: [ 'on' ],
      name: 'promise'
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
      class:  'foam.core.String'
    }
  ],

  methods: [
    function init() {
      var objs = localStorage.getItem(this.name);
      if ( objs ) this.array = foam.json.parse(foam.json.parseString(objs));

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


foam.LIB({
  name: 'foam.String',
  methods: [
    {
      name: 'daoize',
      code: foam.Function.memoize1(function(str) {
        // Turns SomeClassName into someClassNameDAO.
        return str.substring(0, 1).toLowerCase() + str.substring(1) + 'DAO';
      })
    }
  ]
});


/*
TODO:
-Context oriented ?
-enforcement of interfaces
-anonymous sinks ?
*/
