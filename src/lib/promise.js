foam.CLASS({
  package: 'foam.promise',
  name: 'IPromise',
  methods: [
    function then(success, fail) {},
    function fulfill(v) {},
    function reject(e) {}
  ]
});

foam.CLASS({
  package: 'foam.promise',
  name: 'Pending',
  implements: ['foam.promise.IPromise'],
  methods: [
    function then(success, fail) {
      var next = this.cls_.create();
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
      this.state = this.STATE_RESOLVING;
    },
    function reject(e) {
      this.err = e;
      this.state = this.STATE_REJECTED;
    }
  ]
});

foam.CLASS({
  package: 'foam.promise',
  name: 'Resolving',
  extends: 'foam.promise.Pending',
  methods: [
    function onEnter(from) {
      this.resolve_(this.value);
    }
  ]
});

foam.CLASS({
  package: 'foam.promise',
  name: 'Fulfilled',
  implements: ['foam.promise.IPromise'],
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
  name: 'Rejected',
  implements: ['foam.promise.IPromise'],
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
  requires: [
    'foam.promise.Pending',
    'foam.promise.Resolving',
    'foam.promise.Fulfilled',
    'foam.promise.Rejected'
  ],
  properties: [
    {
      class: 'StateMachine',
      of: 'foam.promise.IPromise',
      name: 'state',
      states: [
        'foam.promise.Pending',
        'foam.promise.Resolving',
        'foam.promise.Fulfilled',
        'foam.promise.Rejected'
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
          self.state = self.STATE_REJECTED;
        });
      } else {
        this.value = value;
        this.state = this.STATE_FULFILLED;
      }
    },
    function put(obj) { this.fulfill(obj); },
    function remove(obj) { this.fulfill(obj); },
    function error(e) { this.reject(e); }
  ]
});

foam.CLASS({
  package: 'foam.promise',
  name: 'xPromise',
  properties: [
    {
      name: 'p',
      factory: function() {
        var self = this;
        return new Promise(function(f, r) {
          self.fulfill_ = f;
          self.reject_ = r;
        })
      }
    },
    'fulfill_',
    'reject_'
  ],
  methods: [
    function put(a) { this.fulfill(a); },
    function remove(a) { this.fulfill(a); },
    function error(e) { this.reject(e); },
    function fulfill(v) {
      this.p;
      if ( this.fulfill_ ) this.fulfill_(v);
    },
    function reject(e) {
      this.p;
      if ( this.reject_ ) this.reject_(e);
    },
    function then(a, b) {
      return this.p.then(a, b);
    }
  ]
});
