foam.CLASS({
  package: 'foam.core',
  name: 'StateMachine',
  extends: 'Proxy',
  properties: [
    {
      class: 'StringArray',
      name: 'states'
    },
    {
      name: 'factory',
      expression: function(states) {
        var initial = foam.string.constantize(states[0]);
        return function() {
          return this[initial];
        };
      }
    },
    // TODO: Should onenter/onleave be handled by per-state postset/preset?
    {
      name: 'postSet',
      defaultValue: function(o, s) {
        if ( this.onEnter ) this.onEnter(o);
      }
    },
    {
      name: 'preSet',
      defaultValue: function(o, s) {
        if ( o && this.onLeave ) this.onLeave(s);
        return s;
      }
    },
    {
      name: 'delegates',
      expression: function(of) {
        var intf = foam.lookup(of);
        return intf.getAxiomsByClass(foam.core.Method)
          .filter(function(m) { return intf.hasOwnAxiom(m.name); })
          .map(function(m) { return m.name; });
      }
    }
  ],
  methods: [
    function installInClass(cls) {
      var of = this.of;
      var states = this.states.map(function(m) { return foam.lookup(cls.package + '.' + m + cls.name); });

      for ( var i = 0 ; i < states.length ; i++ ) {
        var constant = foam.core.Constant.create({
          name: this.states[i],
          // TODO: Is this right?  Should each state be a singleton?
          // depends on whether states can have local state or not.  If all
          // methods are delegated rather than forwarded, then they probably should
          // be singletons
          value: states[i].create()
        });
        cls.installAxiom(constant);
      }
      this.SUPER(cls);
    }
  ]
});

foam.CLASS({
  package: 'foam.promise',
  name: 'PromiseState',
  methods: [
    function onEnter() {},
    function onLeave() {},
    function then() {},
    function fulfill() {},
    function reject() {}
  ]
});

foam.CLASS({
  package: 'foam.promise',
  name: 'PendingPromise',
  implements: ['foam.promise.PromiseState'],
  methods: [
    function then(success, fail) {
      var next = foam.promise.Promise.create();
      var self = this;
      this.successCallbacks.push(function() {
        if ( ! success ) {
          next.fulfill(self.value);
          return;
        }

        try {
          var value = success(self.value);
        } catch(e) {
          next.reject(e);
          return;
        }

        next.fulfill(value);
      });

      this.failCallbacks.push(function() {
        if ( ! fail ) {
          next.reject(self.err);
          return;
        }

        try {
          var value = fail(self.err);
        } catch(e) {
          next.reject(e);
          return;
        }

        next.fulfill(value);
      });

      return next;
    },
    function fulfill(value) {
      this.value = value;
      this.state = this.RESOLVING;
    },
    function reject(e) {
      this.err = e;
      this.state = this.REJECTED;
    }
  ]
});

foam.CLASS({
  package: 'foam.promise',
  extends: 'foam.promise.PendingPromise',
  name: 'ResolvingPromise',
  methods: [
    function onEnter(from) {
      this.resolve_(this.value);
    }
  ]
});

foam.CLASS({
  package: 'foam.promise',
  name: 'FulfilledPromise',
  implements: ['foam.promise.PromiseState'],
  methods: [
    function then(success, fail) {
      var next = this.cls_.create();
      if ( typeof success !== "function" ) next.fulfill(this.value);
      else next.fulfill(success(this.value));

      return next;
    },
    function fulfill(value) {
      throw new Error("Promise already fulfilld.");
    },
    function reject(e) {
      this.fulfill(e);
    },
    function onEnter() {
      var callbacks = this.successCallbacks;
      this.successCallbacks = this.failCallbacks = [];

      for ( var i = 0 ; i < callbacks.length ; i++ ) {
        callbacks[i](this.value);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.promise',
  name: 'RejectedPromise',
  implements: ['foam.promise.PromiseState'],
  methods: [
    function then(success, fail) {
      var next = this.cls_.create();
      if ( typeof fail !== "function" ) next.reject(this.err);
      else next.fulfill(fail(this.err));

      return next;
    },
    function onEnter() {
      var callbacks = this.failCallbacks;
      this.failCallbacks = this.successCallbacks = [];
      for ( var i = 0 ; i < callbacks.length ; i++ ) {
        callbacks[i](this.err);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.promise',
  name: 'Promise',
  properties: [
    {
      class: 'StateMachine',
      of: 'foam.promise.PromiseState',
      name: 'state',
      states: [
        'Pending',
        'Resolving',
        'Fulfilled',
        'Rejected'
      ]
    },
    {
      name: 'value'
    },
    {
      name: 'err'
    },
    {
      name: 'successCallbacks',
      factory: function() { return []; }
    },
    {
      name: 'failCallbacks',
      factory: function() { return []; }
    }
  ],
  methods: [
    function resolve_(value) {
      if ( value === this ) {
        this.reject(new TypeError("Promise resolved with itself"));
      } else if ( value && typeof value.then == "function" ) {
        var self = this;
        value.then(function(v) {
          self.resolve_(v);
        }, function(e) {
          self.err = e;
          self.state = self.REJECTED;
        });
      } else {
        this.value = value;
        this.state = this.FULFILLED;
      }
    },
    function put(obj) { this.fulfill(obj); },
    function error(e) { this.reject(e); }
  ]
});
