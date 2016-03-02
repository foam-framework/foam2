foam.CLASS({
  package: 'foam.core',
  name: 'Proxy',
  extends: 'Property',
  properties: [ 'of' ],
  methods: [
    function installInClass(cls) {
      this.SUPER(cls);

      var delegate = foam.lookup(this.of);
      var name = this.name;
      var methods = delegate.getAxiomsByClass(foam.core.Method)
          .filter(function(m) {
            // TODO Is this the right check?
            return delegate.hasOwnAxiom(m.name);
          }).map(function(m) {
            m = m.clone();
            m.code = Function("return this." + name + "." + m.name + ".apply(this.delegate, arguments);");
            cls.installAxiom(m);
          });
    }
  ]
});

// TODO: Seems like there should be a better entry point for this.
// In a ModelDAO scenario, we could auto generate the ProxyABC model
// when requested if there isn't one already in the DAO.  Maybe we
// could register a factory in the context?
foam.INTERFACE = function(json) {
  var model = foam.core.Model.create(json);
  var intf = foam.CLASS(json);
  return intf;

  var proxy = foam.core.Model.create({
    name: "Proxy" + intf.name,
    package: intf.package,
    implements: [intf.id],
    properties: [
      {
        name: 'delegate'
      }
    ]
  });

  var methods = intf.getAxiomsByClass(foam.core.Method).filter(function(m) { return intf.hasOwnAxiom(m.name); });

  for ( var i = 0 ; i < methods.length ; i++ ){
    if ( methods[i].code ) continue;

    if ( methods[i].args ) {
      var createArgs = methods[i].args.slice();
      createArgs.push("return this.delegate." + methods[i].name + '(' + methods[i].args.join(',') + ')');
      var code = Function.apply(Function, createArgs);
    } else {
      code = Function("return this.delegate." + methods[i].name + ".apply(this.delegate, arguments);");
    }

    methods[i] = foam.core.Method.create({
      name: methods[i].name,
      code: code
    });
  }

  proxy.methods = methods;
  proxy.getClass();
};

foam.INTERFACE({
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
  implements: ['foam.dao.Sink'],
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
  documentation: 'DAO Interface',
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
  name: 'Promise',
  properties: [
    {
      name: 'value',
      final: true,
      postSet: function() { this.resolved = true; this.maybeResolve_(); }
    },
    {
      name:'error',
      final: true,
      postSet: function() { this.resolved = true; this.maybeResolve_(); }
    },
    {
      name: 'resolved',
      final: true,
      defaultValue: false
    }
  ],
  topics: [
    'success',
    'failure'
  ],
  methods: [
    function maybeResolve_() {
      if ( ! this.resolved ) return;
      if ( this.hasOwnProperty('value') )
        this.success.publish(this.value);
      else
        this.failure.publish(this.error);
    },
    function resolve(value) {
      if ( value === this ) {
        this.error = new TypeError("Resolved promise with itself");
      } else if ( value && value.then ) {
        var self = this;
        value.then(function(a) {
          self.resolve(a);
        }, function(a) {
          self.error = a;
        });
      } else {
        this.value = value;
      }
    },
    function then(success, fail) {
      var self = this;
      var next = this.cls_.create();

      if ( success ) this.success.subscribe(function(s, _, v) {
        s.destroy();
        next.resolve(success(v));
      });

      if ( fail ) this.failure.subscribe(function(s, _, v) {
        s.destroy();
        next.resolve(fail(v));
      });

      this.maybeResolve_();
      return next;
    }
  ]
});

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
      class: 'Array'
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
  package: 'foam.dao',
  name: 'AbstractDAO',
  implements: ['foam.dao.DAO'],
  requires: [
    'foam.dao.ExternalException',
    'foam.dao.InternalException',
    'foam.dao.Promise',
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
    'onPut',
    'onRemove'
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
  package: 'foam.core',
  name: 'Proxies',
  properties: [
    {
      name: 'delegate'
    }
  ],
  methods: [
    function installInClass(cls) {
      var proxee = foam.lookup(this.delegate);

      var delegateProp = foam.core.Property.create({
        name: 'delegate'
      });

      cls.installAxiom(delegateProp);

      var methods = proxee
          .getAxiomsByClass(foam.core.Method)
          .filter(function(m) {
            return proxee.hasOwnAxiom(m.name) && ! cls.hasOwnAxiom(m.name);
          })
          .forEach(function(m) {
            m = m.clone();
            m.code = Function("return this.delegate." + m.name + ".apply(this.delegate, arguments);");
            cls.installAxiom(m);
          });
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ProxiesAxiom',
  refines: 'foam.core.Model',
  properties: [
    {
      name: 'proxies',
      postSet: function(_, v) {
        this.axioms_.push(foam.core.Proxies.create({ delegate: v }));
      }
    }
  ]
});

// TODO: Settle on an implementation of Proxy DAO.
// We need better way of generating the Proxy that allows for easy customization
// methods.
foam.CLASS({
  package: 'foam.dao',
  name: 'ProxyDAO',
  extends: 'foam.dao.AbstractDAO',
  methods: [
    function where(p) { return this.SUPER(p); },
    function orderBy(c) { return this.SUPER(c); },
    function skip(s) { return this.SUPER(s); },
    function limit(l) { return this.SUPER(l); }
  ],
  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate'
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'MProxyDAO',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      name: 'delegate'
    }
  ],
  methods: [
    function put(obj, sink) {
      return this.delegate.put(obj, sink);
    },
    function remove(obj, sink) {
      return this.delegate.remove(obj, sink);
    },
    function select(sink, options) {
      return this.delegate.select(sink, options);
    },
    function update() {

    },
    function find(obj) {
      return this.delegate.find(obj);
    },
    function removeAll(sink, options) {
      return this.delegate.removeAll(sink, options);
    },
    function listen(sink, options) {
    },
    function unlisten(sink) {
    },
  ],
});

foam.CLASS({
  package: 'foam.dao',
  name: 'FilteredDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.dao.DAOOptions'
  ],
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
  requires:[
    'foam.dao.DAOOptions',
  ],
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
  requires: [
    'foam.dao.DAOOptions'
  ],
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
  requires: [
    'foam.dao.DAOOptions'
  ],
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
  name: 'ArrayDAO',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      name: 'array',
      class: 'Array'
    }
  ],
  methods: [
    function put(obj, sink) {
      var promise = this.Promise.create();

      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(obj.id, this.array[i].id) ) {
          this.array[i] = obj;
          break;
        }
      }

      if ( i == this.array.length ) this.array.push(obj);
      promise.value = obj;

      this.onPut.publish(obj);

      return promise;
    },
    function remove(obj, sink) {
      var promise = this.Promise.create({ value: '' });

      var id = obj.id ? obj.id : obj;

      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(id, this.array[i].id) ) {
          var o2 = this.array.splice(i, 1);
          break;
        }
      }

      this.onRemove.publish(o2[0] || obj);

      return promise;
    },
    function select(sink, options) {
      sink = this.decorateSink_(sink || this.ArraySink.create(), options);

      var promise = this.Promise.create();

      var fc = this.FlowControl.create();
      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( fc.stopped ) break;
        if ( fc.errorEvt ) {
          sink.error(fc.errorEvt);
          promise.error = fc.errorEvt;
          return promise;
        }

        sink.put(this.array[i], null, fc);
      }

      sink.eof();

      promise.value = sink;
      return promise;
    },
    function removeAll(sink, options) {
      if ( ! sink && ( ! options || ! options.where ) ) {
        this.array = [];
        return this.Promise.create({ value: '' });
      }

      // TODO: Require TrueExpr when ordering is fixed or we have
      // better lazy loading
      var predicate = ( options && options.where ) || foam.mlang.TrueExpr.create();

      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( predicate.f(this.array[i]) ) {
          var obj = this.array.splice(i, 1);
          i--;
          sink && sink.remove(obj);
          this.onRemove.publish(obj);
        }
      }

      sink && sink.eof();

      return this.Promise.create({ value: sink || '' });
    },
    function find(id) {
      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(id, this.array[i].id) ) {
          return this.Promise.create({ value: this.array[i] });
        }
      }

      return this.Promise.create({ error: this.ExternalException.create({ message: 'No record for ' + id }) });
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'IDBDAO'
});

/*
TODO:
-mlangs
-internal vs external errors.
-Context oriented?

-interface generated proxy didn't work for skip/limit/orderby.  I needed the abstract dao implementation


questions:
-listen/unlisten using Topics ?
-promises vs sinks
  Sinks make chaining easier dao1.put(obj, dao2);
  Promises more compatible.
-enforcement of interfaces
-generation of ProxyDAO from DAO interface
-anonymous sinks?
-removeAll still takes a sink?

*/
