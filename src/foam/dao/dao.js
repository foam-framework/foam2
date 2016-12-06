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
      class: 'Object',
      name: 'errorEvt'
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
  implements: [ 'foam.dao.Sink' ],

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
        },
        {
          name: 'skip',
          javaType: 'Integer'
        },
        {
          name: 'limit',
          javaType: 'Integer'
        },
        {
          name: 'order',
          javaType: 'foam.mlang.order.Comparator'
        },
        {
          name: 'predicate',
          javaType: 'foam.mlang.predicate.Predicate'
        }
      ]
    },
    {
      name: 'removeAll',
      returns: '',
      javaReturns: 'void',
      args: [
        {
          name: 'skip',
          javaType: 'Integer'
        },
        {
          name: 'limit',
          javaType: 'Integer'
        },
        {
          name: 'order',
          javaType: 'foam.mlang.order.Comparator'
        },
        {
          name: 'predicate',
          javaType: 'foam.mlang.predicate.Predicate'
        }
      ]
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

  implements: [ 'foam.dao.Sink' ],

  methods: [
    {
      name: 'put',
      code: function() {},
      javaCode: 'return;'
    },
    {
      name: 'remove',
      code: function() {},
      javaCode: 'return;'
    },
    {
      name: 'eof',
      code: function() {},
      javaCode: 'return;'
    },
    {
      name: 'error',
      code: function() {},
      javaCode: 'return;'
    },
    {
      name: 'reset',
      code: function() {},
      javaCode: 'return;'
    }
  ]
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
  name: 'AnonymousSink',
  implements: [ 'foam.dao.Sink' ],
  properties: [
    {
      name: 'sink'
    }
  ],
  methods: [
    function put(obj, fc) {
      var s = this.sink;
      s && s.put && s.put(obj, fc);
    },
    function remove(obj, fc) {
      var s = this.sink;
      s && s.remove && s.remove(obj, fc);
    },
    function eof() {
      var s = this.sink;
      s && s.eof && s.eof();
    },
    function error() {
      var s = this.sink;
      s && s.error && s.error();
    },
    function reset() {
      var s = this.sink;
      s && s.reset && s.reset();
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'PredicatedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, fc) {
        if ( this.predicate.f(obj) ) this.delegate.put(obj, fc);
      },
      javaCode: 'if ( getPredicate().f(obj) ) getDelegate().put(obj, fc);'
    },
    {
      name: 'remove',
      code:     function remove(obj, fc) {
        if ( this.predicate.f(obj) ) this.delegate.remove(obj, fc);
      },
      javaCode: 'if ( getPredicate().f(obj) ) getDelegate().remove(obj, fc);'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LimitedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Int',
      name: 'limit'
    },
    {
      name: 'count',
      class: 'Int',
      value: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, fc) {
        if ( this.count++ >= this.limit ) {
          fc && fc.stop();
        } else {
          this.delegate.put(obj, fc);
        }
      },
      javaCode: 'if ( getCount() >= getLimit() ) {\n'
              + '  fc.stop();\n'
              + '} else {\n'
              + '  setCount(getCount() + 1);\n'
              + '  getDelegate().put(obj, fc);\n'
              + '}\n'
    },
    {
      name: 'remove',
      code: function remove(obj, fc) {
        if ( this.count++ >= this.limit ) {
          fc && fc.stop();
        } else {
          this.delegate.remove(obj, fc);
        }
      },
      javaCode: 'if ( getCount() >= getLimit() ) {\n'
              + '  fc.stop();\n'
              + '} else {'
              + '  setCount(getCount() + 1);\n'
              + '  getDelegate().put(obj, fc);\n'
              + '}\n'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'SkipSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Int',
      name: 'skip'
    },
    {
      name: 'count',
      class: 'Int',
      value: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, fc) {
        if ( this.count < this.skip ) {
          this.count++;
          return;
        }

        this.delegate.put(obj, fc);
      },
      javaCode: 'if ( getCount() < getSkip() ) {\n'
              + '  setCount(getCount() + 1);\n'
              + '  return;'
              + '}\n'
              + 'getDelegate().put(obj, fc);'
    },
    {
      name: 'remove',
      code: function remove(obj, fc) {
        if ( this.count < this.skip ) {
          this.count++;
          return;
        }
        this.delegate.remove(obj, fc);
      },
      javaCode: 'if ( getCount() < getSkip() ) {\n'
              + '  setCount(getCount() + 1);\n'
              + '  return;'
              + '}\n'
              + 'getDelegate().remove(obj, fc);'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'OrderedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.order.Comparator',
      name: 'comparator'
    },
    {
      class: 'Object',
      name: 'array',
      javaType: 'java.util.List',
      // TODO(adamvy): Java factory
      factory: function() { return []; }
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, fc) {
        this.array.push(obj);
      },
      javaCode: 'if ( getArray() == null ) setArray(new java.util.ArrayList());\n'
                + 'getArray().add(obj);'
    },
    {
      name: 'eof',
      code: function eof() {
        var comparator = this.comparator;
        this.array.sort(function(o1, o2) {
          return comparator.compare(o1, o2);
        });

        for ( var i = 0 ; i < this.array.length ; i++ ) {
          this.delegate.put(this.array[i]);
        }
      },
      javaCode: 'if ( getArray() == null ) setArray(new java.util.ArrayList());\n'
                + 'java.util.Collections.sort(getArray());\n'
                + 'foam.dao.FlowControl fc = (foam.dao.FlowControl)getX().create(foam.dao.FlowControl.class);\n'
                + 'for ( Object o : getArray() ) {\n'
                + '  if ( fc.getStopped() || fc.getErrorEvt() != null ) {\n'
                + '    break;\n'
                + '  }\n'
                + '  getDelegate().put((foam.core.FObject)o, fc);\n'
                + '}'
    },

    function remove(obj, fc) {
      // TODO
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'DedupSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      /** @private */
      name: 'results_',
      hidden: true,
      factory: function() { return {}; }
    },
  ],

  methods: [
    {
      /** If the object to be put() has already been seen by this sink,
        ignore it */
      name: 'put',
      code: function put(obj, fc) {
        if ( ! this.results_[obj.id] ) {
          this.results_[obj.id] = true;
          return this.delegate.put(obj, fc);
        }
      }
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


/**
  The base class for most DAOs, defining basic DAO behavior.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractDAO',
  implements: [ 'foam.dao.DAO' ],

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
      /**
        Set to the name or class instance of the type of object the DAO
        will store.
      */
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    {
      /**
        Returns a filtered DAO that only returns objects which match the
        given predicate.
      */
      name: 'where',
      code: function where(/* foam.mlang.predicate.Predicate */ p
          /* foam.dao.DAO */) {
        return this.FilteredDAO.create({
          delegate: this,
          predicate: p
        });
      }
    },

    {
      /**
        Returns a filtered DAO that orders select() by the given
        ordering.
      */
      name: 'orderBy',
      code: function orderBy(/* foam.mlang.order.Comparator */
          /* foam.dao.DAO */) {
        return this.OrderedDAO.create({
          delegate: this,
          comparator: foam.compare.toCompare(Array.from(arguments))
        });
      }
    },

    {
      /**
        Returns a filtered DAO that skips the given number of items
        on a select()
      */
      name: 'skip',
      code: function skip(/* number */ s /* foam.dao.DAO */ ) {
        return this.SkipDAO.create({
          delegate: this,
          skip_: s
        });
      }
    },

    {
      /**
        Returns a filtered DAO that stops producing items after the
        given count on a select().
      */
      name: 'limit',
      code: function limit(/* number */ l /* foam.dao.DAO */) {
        return this.LimitedDAO.create({
          delegate: this,
          limit_: l
        });
      }
    },

    /**
      Selects the contents of this DAO into a sink, then listens to keep
      the sink up to date. Returns a promise that resolves with the subscription.
    */
    function pipe(/* foam.dao.Sink */ sink /* Promise */) {
      var self = this;
      return self.select(sink).then(function() {
        return self.listen(sink);
      });
    },

    /**
      Keeps the given sink up to date with changes to this DAO.
    */
    function listen(
      /* foam.dao.Sink */                   sink,
      /* foam.mlang.predicate.Predicate? */ predicate
        /* object // The subscription object, with a .destroy() to clean up. */
    ) {
      var mySink = this.decorateSink_(sink, undefined, undefined, undefined, predicate);

      var fc = this.FlowControl.create();
      var sub;

      fc.propertyChange.sub(function(s, _, pname) {
        if ( pname == "stopped") {
          if ( sub ) sub.destroy();
        } else if ( pname === "errorEvt" ) {
          if ( sub ) sub.destroy();
          mySink.error(fc.errorEvt);
        }
      });

      // Note that FilteredDAO, LimitedDAO, OrderedDAO and SkipDAO all
      // pass listen() calls down through the delegate chain, so the
      // topics we subscribe to are not filtered by those DAO decorators.
      // The sink we create in .decorateSink_() is responsible for filtering.
      return this.on.sub(function(s, on, e, obj) {
        sub = s;
        switch(e) {
        case 'put':
          mySink.put(obj, fc);
          break;
        case 'remove':
          mySink.remove(obj, fc);
          break;
        case 'reset':
          mySink.reset();
          break;
        }
      });
    },

    /**
      Used by DAO implementations to apply filters to a sink, often in a
      select() or removeAll() implementation.
      @private
    */
    function decorateSink_(sink, skip, limit, order, predicate) {
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

      if ( order != undefined ) {
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

    function compareTo(other) {
      if ( ! other ) return 1;
      return this === other ? 0 : foam.util.compare(this.$UID, other.$UID);
    },

    // Placeholder functions to that selecting from DAO to DAO works.
    /** @private */
    function eof() {},
    /** @private */
    function error() {},
    /** @private */
    function reset() {}
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
    },
    {
      name: 'of',
      expression: function(delegate) {
        return delegate.of;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'FilteredDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.mlang.predicate.And'
  ],

  properties: [
    {
      name: 'predicate',
      required: true
    },
    {
      name: 'of',
      expression: function(delegate) {
        return delegate.of;
      }
    },
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      topics: [],
      forwards: [ 'put', 'remove', 'find', 'select', 'removeAll' ],
      postSet: function(old, nu) {
        // Only fire a 'reset' when the delegate is actually changing, not being
        // set for the first time.
        if ( old ) {
          this.on.reset.pub();
        }

        // TODO: replace this with a manually installed ProxySub,
        //   or implement interceptors in Proxy
        if ( this.delegateSub_ ) {
          this.delegateSub_.destroy();
          this.delegateSub_ = nu.on.sub(this.onEvent);
        }
      }
    },
    'delegateSub_',
  ],

  listeners: [
    /** If the predicate returns false for the object added or updated, change
      to an on.remove event. If the listener had previously been told about
      the object, it should now remove it since it no longer matches. */
    function onEvent(s, on, putRemoveReset, obj) {
      if ( putRemoveReset === 'put' ) {
        if ( this.predicate.f(obj) ) {
          this.pub(on, 'put', obj);
        } else {
          this.pub(on, 'remove', obj);
        }
      } else {
        this.pub(on, putRemoveReset, obj);
      }
    },
  ],

  methods: [
    function sub(arg1) {
      if ( arg1 === 'on' && ! this.delegateSub_ ) {
        var self = this;
        this.delegateSub_ = this.delegate.on.sub(this.onEvent);
        this.onDestroy(function() {
          self.delegateSub_ && self.delegateSub_.destroy();
          self.delegateSub_ = null;
        });
      }
      return this.SUPER.apply(this, arguments);
    },

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
    },

    function listen(sink, predicate) {
      return this.delegate.listen(
        sink,
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
      return this.delegate.select(sink, skip, limit, order ? order : this.comparator, predicate);
    },
    function removeAll(skip, limit, order, predicate) {
      return this.delegate.removeAll(skip, limit, order ? order : this.comparator, predicate);
    },
    function listen(sink, predicate) {
      return this.delegate.listen(sink, predicate);
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
    },
    function listen(sink, predicate) {
      return this.delegate.listen(sink, predicate);
    },
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
    },

    function listen(sink, predicate) {
      return this.delegate.listen(sink, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ArraySink',
  extends: 'foam.dao.AbstractSink',

  properties: [
    {
      name: 'a',
      factory: function() { return []; },
      fromJSON: function(json, ctx) {
        return foam.json.parse(json, null, ctx);
      }
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
        if ( obj.ID.compare(obj, this.array[i]) === 0 ) {
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
      skip = skip || 0;
      limit = foam.Number.isInstance(limit) ? limit : Number.MAX_VALUE;

      for ( var i = 0; i < this.array.length && limit > 0; i++ ) {
        if ( predicate.f(this.array[i]) ) {
          if ( skip > 0 ) {
            skip--;
            continue;
          }
          var obj = this.array.splice(i, 1)[0];
          i--;
          limit--;
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
      if ( objs ) this.array = foam.json.parseString(objs, this);

      this.on.put.sub(this.updated);
      this.on.remove.sub(this.updated);

      // TODO: base on an indexed DAO
    }
  ],

  listeners: [
    {
      name: 'updated',
      isMerged: true,
      mergeDelay: 100,
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
        // Turns SomeClassName into someClassNameDAO,
        // of package.ClassName into package.ClassNameDAO
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
