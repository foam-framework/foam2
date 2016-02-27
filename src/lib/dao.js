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

// TODO: Seems like there should be a better entry point for this.
// In a ModelDAO scenario, we could auto generate the ProxyABC model
// when requested if there isn't one already in the DAO.  Maybe we
// could register a factory in the context?
foam.INTERFACE = function(json) {
  var intf = foam.CLASS(json);

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

  var methods = intf.getAxiomsByClass(foam.core.Method);

  for ( var i = 0 ; i < methods.length ; i++ ){
    if ( ! intf.hasOwnAxiom(methods[i].name) ) continue;

    if ( methods[i].args ) {
      var createArgs = methods[i].args.slice();
      createArgs.push("return this.delegate." + methods[i].name + '(' + methods[i].args.join(',') + ')');
      var code = Function.apply(Function, createArgs);
    } else {
      code = Function("return this.delegate." + methods[i].name + ".apply(this, arguments);");
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
      if ( this.predicate.f(obj) ) this.delegate.put(obj, fc, sink);
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
        this.delegate.put(obj, s, fc);
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
      // TODO: This seems wrong
      this.arr.push(obj);
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'DAOOptions',
  properties: [
    'skip',
    'limit',
    'orderBy',
    'where'
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
    'foam.dao.PredicatedSink'
  ],
  topics: [
    'onPut',
    'onRemove'
  ],
  methods: [
    function put() {},
    function remove() { },
    function find() { },
    function select() { },
    function removeAll() { },
    function listen(sink, options) {
    },
    function unlisten(sink) {
    },
    function pipe() { },
    function update() { },
    function where() { },
    function orderBy() { },
    function skip() { },
    function limit() { },

    function decorateSink_(sink, options, isListener, disableLimit) {
      if ( options ) {
        if ( ! disableLimit ) {
          if ( options.limit )
            sink = this.LimitedSink.create({
              limit: options.limit,
              delegate: sink
            });

          if ( options.skip )
            sink = this.SkipSink.create({
              skip: options.skip,
              delegate: sink
            });
        }

        if ( options.order && ! isListener )
          sink = this.OrderedSink.create({
            order: options.order,
            delegate: sink
          });

        if ( options.query )
          sink = this.PredicatedSink.create({
            predicate: options.query.partialEval ?
              options.query.partialEval() :
              options.query,
            delegate: sink
          });
      }

      return sink;
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

      return promise;
    },
    function remove(obj, sink) {
      var promise = this.Promise.create({ value: '' });

      var id = obj.id ? obj.id : obj;

      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( foam.util.equals(id, this.array[i].id) ) {
          this.array.splice(i, 1);
          break;
        }
      }

      return promise;
    },
    function select(sink, options) {
      sink = this.decorateSink_(sink || this.ArraySink.create());

      var promise = this.Promise.create();

      var fc = this.FlowControl.create();
      for ( var i = 0 ; i < this.array.length ; i++ ) {
        if ( fc.stopped ) break;
        if ( fc.errorEvt ) {
          sink.error(fc.errorEvt);
          promise.error = fc.errorEvt;
          break;
        }

        sink.put(this.array[i], null, fc);
      }

      sink.eof();

      promise.value = sink;
      return promise;
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

questions:
-listen/unlisten using Topics ?
-promises vs sinks
  Sinks make chaining easier dao1.put(obj, dao2);
  Promises more compatible.
-enforcement of interfaces
-generation of ProxyDAO from DAO interface
-anonymous sinks?

*/
