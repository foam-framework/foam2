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
  name: 'AbstractDAO',
  implements: [ 'foam.dao.DAO' ],
  abstract: true,

  documentation: 'Abstract base class for implementing DAOs.',

  requires: [
    'foam.dao.ExternalException',
    'foam.dao.FilteredDAO',
    'foam.dao.InternalException',
    'foam.dao.LimitedDAO',
    'foam.dao.LimitedSink',
    'foam.dao.OrderedDAO',
    'foam.dao.OrderedSink',
    'foam.dao.PipeSink',
    'foam.dao.PredicatedSink',
    'foam.dao.ProxyDAO',
    'foam.dao.ResetListener',
    'foam.dao.SkipDAO',
    'foam.dao.SkipSink'
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
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      javaType: 'foam.core.ClassInfo',
      name: 'of',
    },
    {
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      swiftType: 'PropertyInfo',
      name: 'primaryKey',
      swiftExpressionArgs: ['of'],
      swiftExpression: 'return of.axiom(byName: "id") as! PropertyInfo',
      javaFactory: `
return getOf() == null ? null : (foam.core.PropertyInfo) getOf().getAxiomByName("id");
      `,
    },
  ],

  methods: [
    {
      /**
        Returns a filtered DAO that only returns objects which match the
        given predicate.
      */
      name: 'inX',
      code: function(x) {
        return this.ProxyDAO.create({delegate: this}, x);
      },
      javaCode: `return new ProxyDAO.Builder(x).setDelegate(this).build();`,
    },

    {
      /**
        Returns a filtered DAO that only returns objects which match the
        given predicate.
      */
      name: 'where',
      code: function where(p) {
        return this.FilteredDAO.create({
          delegate: this,
          predicate: p
        });
      },
      swiftCode: function() {/*
        return FilteredDAO_create([
          "delegate": self,
          "predicate": predicate,
        ]);
      */},
      javaCode: `
return new FilteredDAO(predicate, this);
      `,
    },

    {
      /**
        Returns a filtered DAO that orders select() by the given
        ordering.
      */
      name: 'orderBy',
      code: function orderBy() {
        return this.OrderedDAO.create({
          delegate: this,
          comparator: foam.compare.toCompare(Array.from(arguments))
        });
      },
      javaCode: `
return new OrderedDAO(comparator, this);
      `,
    },

    {
      /**
        Returns a filtered DAO that skips the given number of items
        on a select()
      */
      name: 'skip',
      code: function skip(/* Number */ s) {
        return this.SkipDAO.create({
          delegate: this,
          skip_: s
        });
      },
      swiftCode: function() {/*
return SkipDAO_create([
  "delegate": self,
  "skip_": count,
])
      */},
      javaCode: `
return new SkipDAO(count, this);
      `,
    },

    {
      /**
        Returns a filtered DAO that stops producing items after the
        given count on a select().
      */
      name: 'limit',
      code: function limit(/* Number */ l) {
        return this.LimitedDAO.create({
          delegate: this,
          limit_: l
        });
      },
      swiftCode: function() {/*
return LimitedDAO_create([
  "delegate": self,
  "limit_": count,
])
      */},
      javaCode: `
return new LimitedDAO(count, this);
      `,
    },

    {
      name: 'put',
      code: function(obj) {
        return this.put_(this.__context__, obj);
      },
      swiftCode: 'return try put_(__context__, obj)',
      javaCode: `return this.put_(this.getX(), obj);`,
    },

    /**
      Selects the contents of this DAO into a sink, then listens to keep
      the sink up to date. Returns a promise that resolves with the subscription.
      TODO: This will probably miss events that happen during the select but before the
      listen call.  We should check if this is the case and fix it if so.
    */
    {
      name: 'pipe',
      code: function(sink) {//, skip, limit, order, predicate) {
        this.pipe_(this.__context__, sink, undefined);
      },
      swiftCode: 'return try pipe_(__context__, sink)',
      javaCode: `this.pipe_(this.getX(), sink);`,
    },

    {
      name: 'pipe_',
      code: function(x, sink, predicate) {
        var dao = this;

        var sink = this.PipeSink.create({
          delegate: sink,
          dao: this
        });

        var sub = this.listen(sink); //, skip, limit, order, predicate);
        sink.reset();

        return sub;
      },
      javaCode: `
throw new UnsupportedOperationException();
      `,
    },

    {
      name: 'listen',
      code: function(sink) {
        if ( ! foam.core.FObject.isInstance(sink) ) {
          sink = foam.dao.AnonymousSink.create({ sink: sink }, this);
        }
        return this.listen_(this.__context__, sink, undefined);
      },
      swiftCode: 'return try listen_(__context__, sink)',
      javaCode: `this.listen_(this.getX(), sink, predicate);`,
    },

    /**
      Keeps the given sink up to date with changes to this DAO.
    */
    {
      name: 'listen_',
      code: function(x, sink, predicate) {
        var mySink = this.decorateListener_(sink, predicate);

        var sub = foam.core.FObject.create();

        sub.onDetach(this.on.sub(function(s, on, e, obj) {
          switch(e) {
            case 'put':
              mySink.put(obj, sub);
              break;
            case 'remove':
              mySink.remove(obj, sub);
              break;
            case 'reset':
              mySink.reset(sub);
              break;
          }
        }));

        return sub;
      },
      swiftCode: function() {/*
let mySink = decorateListener_(sink, predicate)
return on.sub(listener: { (sub: Subscription, args: [Any?]) -> Void in
  guard let topic = args[1] as? String else { return }
  switch topic {
    case "put":
      mySink.put(args.last as! FObject, sub)
      break
    case "remove":
      mySink.remove(args.last as! FObject, sub)
      break
    case "reset":
      mySink.reset(sub)
      break
    default:
      break
  }
})
      */},
      javaCode: `
sink = decorateListener_(sink, predicate);
listeners_.add(new DAOListener(sink, listeners_));
      `,
    },

    {
      name: 'decorateListener_',
      swiftReturns: 'Sink',
      javaReturns: 'Sink',
      args: [
        {
          name: 'sink',
          swiftType: 'Sink',
          javaType: 'Sink',
        },
        {
          name: 'predicate',
          swiftType: 'FoamPredicate?',
          javaType: 'foam.mlang.predicate.Predicate',
        },
      ],
      code: function decorateListener_(sink, predicate) {
        if ( predicate ) {
          return this.ResetListener.create({ delegate: sink });
        }

        return sink;
      },
      swiftCode: function() {/*
// TODO: There are probably optimizations we can make here
// but every time I try it comes out broken.  So for the time being,
// if you have any sort of skip/limit/order/predicate we will just
// issue reset events for everything.
if predicate != nil {
  return self.ResetListener_create(["delegate": sink])
}
return sink
      */},
      javaCode: `
if ( predicate != null ) {
  sink = new PredicatedSink(predicate, sink);
}

return sink;
      `,
    },

    /**
      Used by DAO implementations to apply filters to a sink, often in a
      select() or removeAll() implementation.
      @private
    */
    {
      name: 'decorateSink_',
      swiftReturns: 'Sink',
      javaReturns: 'foam.dao.Sink',
      args: [
        {
          name: 'sink',
          swiftType: 'Sink',
          javaType: 'foam.dao.Sink',
        },
        {
          name: 'skip',
          swiftType: 'Int?',
          javaType: 'long',
        },
        {
          name: 'limit',
          swiftType: 'Int?',
          javaType: 'long',
        },
        {
          name: 'order',
          swiftType: 'Comparator?',
          javaType: 'foam.mlang.order.Comparator',
        },
        {
          name: 'predicate',
          swiftType: 'FoamPredicate?',
          javaType: 'foam.mlang.predicate.Predicate',
        },
      ],
      code: function decorateSink_(sink, skip, limit, order, predicate) {
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
      swiftCode: function() {/*
var sink = sink
if limit != nil {
  sink = LimitedSink_create([
    "limit": limit,
    "delegate": sink
  ])
}
if skip != nil {
  sink = SkipSink_create([
    "skip": skip,
    "delegate": sink
  ])
}
if order != nil {
  sink = OrderedSink_create([
    "comparator": order,
    "delegate": sink,
  ])
}
if predicate != nil {
  sink = PredicatedSink_create([
    "predicate": predicate,
    "delegate": sink,
  ])
}
return sink
      */},
      javaCode: `
return decorateSink(getX(), sink, skip, limit, order, predicate);
      `,
    },

    {
      name: 'remove',
      code: function remove(obj) {
        return this.remove_(this.__context__, obj);
      },
      swiftCode: 'return try remove_(__context__, obj)',
      javaCode: `return this.remove_(this.getX(), obj);`,
    },

    {
      name: 'removeAll',
      code: function removeAll() {
        return this.removeAll_(this.__context__, undefined, undefined, undefined, undefined);
      },
      swiftCode: 'return try removeAll_(__context__)',
      javaCode: `
this.removeAll_(this.getX(), 0, this.MAX_SAFE_INTEGER, null, null);
      `,
    },

    function compareTo(other) {
      if ( ! other ) return 1;
      return this === other ? 0 : foam.util.compare(this.$UID, other.$UID);
    },

    function prepareSink_(sink) {
      if ( ! sink ) return foam.dao.ArraySink.create();

      if ( foam.Function.isInstance(sink) )
        sink = {
          put: sink,
          eof: function() {}
        };
      else if ( sink == console || sink == console.log )
        sink = {
          put: function(o) { console.log(o, foam.json.Pretty.stringify(o)); },
          eof: function() {}
        };
      else if ( sink == global.document )
        sink = {
          put: function(o) { foam.u2.DetailView.create({data: o}).write(document); },
          eof: function() {}
        };

      if ( ! foam.core.FObject.isInstance(sink) ) {
        sink = foam.dao.AnonymousSink.create({ sink: sink });
      }

      return sink;
    },

    {
      name: 'select',
      code: function select(sink) {
        return this.select_(this.__context__, this.prepareSink_(sink), undefined, undefined, undefined, undefined);
      },
      swiftCode: 'return try select_(__context__, sink)',
      javaCode: `
sink = prepareSink(sink);
return this.select_(this.getX(), sink, 0, this.MAX_SAFE_INTEGER, null, null);
      `,
    },

    {
      name: 'find',
      code: function find(id) {
        return this.find_(this.__context__, id);
      },
      swiftCode: 'return try find_(__context__, id)',
      javaCode: `
// Temporary until DAO supports find_(Predicate) directly
if ( id instanceof foam.mlang.predicate.Predicate ) {
  java.util.List l = ((ArraySink) this.where((foam.mlang.predicate.Predicate) id).limit(1).select(new ArraySink())).getArray();
  return l.size() == 1 ? (foam.core.FObject) l.get(0) : null;
}

return this.find_(this.getX(), id);
      `,
    },

    {
      name: 'cmd_',
      code: function cmd_(x, obj) {
        return undefined;
      },
      javaCode: `
// TODO
return null;
      `,
    },

    {
      name: 'cmd',
      code: function cmd(obj) {
        return this.cmd_(this.__context__, obj);
      },
      javaCode: `
return this.cmd_(this.getX(), obj);
      `,
    },

    // Placeholder functions to that selecting from DAO to DAO works.
    /** @private */
    function eof() {},

    /** @private */
    function reset() {},

    {
      name: 'removeAll_',
      javaCode: `
this.select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
      `,
    },
  ],
  static: [
    {
      name: 'decorateSink',
      javaReturns: 'foam.dao.Sink',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
        },
        {
          name: 'sink',
          javaType: 'foam.dao.Sink',
        },
        {
          name: 'skip',
          javaType: 'long',
        },
        {
          name: 'limit',
          javaType: 'long',
        },
        {
          name: 'order',
          javaType: 'foam.mlang.order.Comparator',
        },
        {
          name: 'predicate',
          javaType: 'foam.mlang.predicate.Predicate',
        },
      ],
      javaCode: `
if ( ( limit > 0 ) && ( limit < AbstractDAO.MAX_SAFE_INTEGER ) ) {
  sink = new LimitedSink(limit, 0, sink);
}

if ( ( skip > 0 ) && ( skip < AbstractDAO.MAX_SAFE_INTEGER ) ) {
  sink = new SkipSink(skip, 0, sink);
}

if ( order != null ) {
  sink = new OrderedSink(order, null, sink);
}

if ( predicate != null ) {
  sink = new PredicatedSink(predicate, sink);
}

return sink;
      `,
    },
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public final static long MAX_SAFE_INTEGER = 9007199254740991l;

public Object getPK(foam.core.FObject obj) {
  return getPrimaryKey().get(obj);
}

protected class DAOListener implements foam.core.Detachable {
  protected Sink sink;
  protected java.util.Collection listeners;

  public DAOListener(Sink sink, java.util.Collection listeners) {
    this.sink = sink;
    this.listeners = listeners;
  }

  public void detach() {
    listeners.remove(this);
  }

  public void put(foam.core.FObject obj) {
    try {
      sink.put(obj, this);
    } catch (java.lang.Exception e) {
      detach();
    }
  }

  public void remove(foam.core.FObject obj) {
    try {
      sink.remove(obj, this);
    } catch (java.lang.Exception e) {
      detach();
    }
  }

  public void reset() {
    try {
      sink.reset(this);
    } catch (java.lang.Exception e) {
      detach();
    }
  }
}

protected java.util.List<DAOListener> listeners_ = new java.util.concurrent.CopyOnWriteArrayList<DAOListener>();

protected void onPut(foam.core.FObject obj) {
  java.util.Iterator<DAOListener> iter = listeners_.iterator();

  while ( iter.hasNext() ) {
    DAOListener s = iter.next();
    s.put(obj);
  }
}

protected void onRemove(foam.core.FObject obj) {
  java.util.Iterator<DAOListener> iter = listeners_.iterator();

  while ( iter.hasNext() ) {
    DAOListener s = iter.next();
    s.remove(obj);
  }
}

protected void onReset() {
  java.util.Iterator<DAOListener> iter = listeners_.iterator();

  while ( iter.hasNext() ) {
    DAOListener s = iter.next();
    s.reset();
  }
}

protected Sink prepareSink(Sink s) {
  return s == null ? new ArraySink() : s;
}

public Sink select() {
  return select(null);
}

public static Sink decorateDedupSink_(Sink sink) {
  sink = new DedupSink(new java.util.HashSet(), sink);
  return sink;
}
        `);
      },
    },
  ],
});


foam.CLASS({
  package: 'foam.dao',
  name: 'InternalException',
  implements: ['foam.core.Exception']
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ExternalException',
  implements: ['foam.core.Exception']
})


foam.CLASS({
  package: 'foam.dao',
  name: 'FilteredDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.mlang.predicate.And'
  ],

  properties: [
    {
      // TODO: FObjectProperty of Predicate. Doing this currently breaks java.
      swiftType: 'FoamPredicate',
      name: 'predicate',
      required: true
    },
    {
      name: 'of',
      factory: function() {
        return this.delegate.of;
      },
      swiftExpressionArgs: ['delegate$of'],
      swiftExpression: 'return delegate$of as! ClassInfo',
    },
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      topics: [ 'on' ], // TODO: Remove this when all users of it are updated.
      forwards: [ 'put_', 'remove_', 'find_', 'select_', 'removeAll_', 'cmd_' ]
    }
  ],

  methods: [
    function find_(x, key) {
      var predicate = this.predicate;
      return this.delegate.find_(x, key).then(function(o) {
        return predicate.f(o) ? o : null;
      });
    },

    {
      name: 'select_',
      code: function(x, sink, skip, limit, order, predicate) {
        return this.delegate.select_(
          x, sink, skip, limit, order,
          predicate ?
            this.And.create({ args: [this.predicate, predicate] }) :
            this.predicate);
      },
      swiftCode: function() {/*
return try delegate.select_(
  x, sink, skip, limit, order,
  predicate != nil ?
    And_create(["args": [self.predicate, predicate!] ]) :
    self.predicate)
      */},
    },

    function removeAll_(x, skip, limit, order, predicate) {
      return this.delegate.removeAll_(
        x, skip, limit, order,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    },

    {
      name: 'listen_',
      code: function listen_(x, sink, predicate) {
        return this.delegate.listen_(
          x, sink,
          predicate ?
            this.And.create({ args: [this.predicate, predicate] }) :
            this.predicate);
      },
      swiftCode: `
return try delegate.listen_(
  x, sink,
  predicate != nil ?
    And_create(["args": [self.predicate, predicate]]) :
    predicate)
      `,
    },
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
    function select_(x, sink, skip, limit, order, predicate) {
      return this.delegate.select_(x, sink, skip, limit, order || this.comparator, predicate);
    },
    function removeAll_(x, skip, limit, order, predicate) {
      return this.delegate.removeAll_(x, skip, limit, order || this.comparator, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'SkipDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      class: 'Int',
      name: 'skip_',
    }
  ],

  methods: [
    {
      name: 'select_',
      code: function select_(x, sink, skip, limit, order, predicate) {
        return this.delegate.select_(x, sink, this.skip_, limit, order, predicate);
      },
      swiftCode: function() {/*
return try delegate.select_(x, sink, skip_, limit, order, predicate)
      */},
    },
    function removeAll_(x, skip, limit, order, predicate) {
      return this.delegate.removeAll_(x, this.skip_, limit, order, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LimitedDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      class: 'Int',
      name: 'limit_'
    }
  ],

  methods: [
    {
      name: 'select_',
      code: function select_(x, sink, skip, limit, order, predicate) {
        return this.delegate.select_(
          x, sink, skip,
          limit !== undefined ? Math.min(this.limit_, limit) : this.limit_,
          order, predicate);
      },
      swiftCode: function() {/*
return try delegate.select_(
    x, sink, skip,
    min(limit_, limit),
    order, predicate);
      */},
    },

    function removeAll_(x, skip, limit, order, predicate) {
      return this.delegate.removeAll_(
        x, skip,
        limit !== undefined ? Math.min(this.limit_, limit) : this.limit_,
        order, predicate);
    }
  ]
});
