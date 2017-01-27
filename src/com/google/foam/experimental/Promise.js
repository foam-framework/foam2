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
  package: 'foam.promise',
  name: 'IPromise',

  methods: [
    function then(success, fail) {},
    { name: "catch", code: function(fail) { return this.then(null, fail); } },
    function fulfill_() {},
    function reject_() {}
  ]
});


foam.CLASS({
  package: 'foam.promise',
  name: 'AbstractState',

  implements: [ 'foam.promise.IPromise' ],

  axioms: [
    foam.pattern.Singleton.create()
  ],

  methods: [
    function fulfill_(value) {
      this.value = value;
      this.state = this.Resolving.create();
    },
    function reject_(e) {
      this.err = e;
      this.state = this.Rejected.create();
    }
  ]
});


foam.CLASS({
  package: 'foam.promise',
  name: 'Pending',
  extends: 'foam.promise.AbstractState',

  methods: [
    function then(success, fail) {
      var next = this.cls_.create();
      var self = this;
      this.successCallbacks.push(function() {
        if ( ! success ) {
          next.fulfill_(self.value);
          return;
        }

        var value;
        try {
          value = success(self.value);
        } catch(e) {
          next.reject_(e);
          return;
        }

        next.fulfill_(value);
      });

      this.failCallbacks.push(function() {
        if ( ! fail ) {
          next.reject_(self.err);
          return;
        }

        var value;
        try {
          value = fail(self.err);
        } catch(e) {
          next.reject_(e);
          return;
        }

        next.fulfill_(value);
      });

      return next;
    }
  ]
});


foam.CLASS({
  package: 'foam.promise',
  name: 'Resolving',
  extends: 'foam.promise.Pending',

  methods: [
    function onEnter() {
      this.resolve_(this.value);
    }
  ]
});


foam.CLASS({
  package: 'foam.promise',
  name: 'Fulfilled',
  extends: 'foam.promise.AbstractState',

  methods: [
    function then(success) {
      var next = this.cls_.create();

      next.fulfill_(
          typeof success !== "function" ? this.value : success(this.value));

      return next;
    },

    function fulfill_() {
      throw new Error("Promise already fulfilled.");
    },

    function reject_(e) {
      this.fulfill_(e);
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
  extends: 'foam.promise.AbstractState',

  methods: [
    function then(success, fail) {
      var next = this.cls_.create();

      if ( typeof fail !== "function" ) {
        next.reject_(this.err);
      } else {
        next.fulfill_(fail(this.err));
      }

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


/**
 * A fast Promise implementation.
 */
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
      class: 'Proxy',
      of: 'foam.promise.IPromise',
      name: 'state',
      delegates: [ 'then', 'catch', 'fulfill_', 'reject_' ],
      factory: function() {
        return this.Pending.create();
      },
      postSet: function(old, nu) {
        if ( nu.onEnter ) nu.onEnter.call(this);
      }
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
        this.reject_(new TypeError("Promise resolved with itself"));
      } else if ( value && typeof value.then === "function" ) {
        var self = this;
        value.then(function(v) {
          self.resolve_(v);
        }, function(e) {
          self.err = e;
          self.state = self.Rejected.create();
        });
      } else {
        this.value = value;
        this.state = this.Fulfilled.create();
      }
    },
  ]
});


/** A library of standard Promise-style constructors */
foam.LIB({
  name: "foam.promise",

  methods: [
    {
      /** Create a new Promise, equivalent to ES6 "new Promise(executor); */
      name: "newPromise",
      code: function(executor) {
        if ( ! ( executor && typeof executor === "function" ) ) {
          this.reject_(new TypeError("Promise created with no executor function (", executor, ")"));
        }
        var p        = foam.promise.Promise.create();
        var thenable = executor.call(null, p.fulfill_.bind(p), p.reject_.bind(p));

        if ( thenable && typeof thenable.then === "function" ) {
          thenable.then(function(v) {
            p.resolve_(v);
          }, function(e) {
            p.err = e;
            p.state = p.Rejected.create();
          });
        }
        return p;
      },
    },
    {
      /** Returns a resolved promise with the given value. */
      name: "resolve",
      code: function (value) {
        var p = foam.promise.Promise.create();

        if ( value && typeof value.then === "function" ) {
          value.then(function(v) {
            p.resolve_(v);
          }, function(e) {
            p.err = e;
            p.state = p.Rejected.create();
          });
        } else {
          p.value = value;
          p.state = p.Fulfilled.create();
        }
        return p;
      },
    },
    {
      /** Returns a rejected promise with the given error value. */
      name: "reject",
      code: function (err) {
        var p = foam.promise.Promise.create();
        p.err = err;
        p.state = p.Rejected.create();
        return p;
      },
    },
    {
      name: "all",
      code: function (/* Array */ promises) {
        var results = [];
        var p = Promise.resolve();

        function runPromise(idx) {
          p = p.then(promises[idx].then(function(r) { results[idx] = r; }));
        }

        for ( var i = 0; i < promises.length; ++i ) {
          runPromise(i);
        }

        return p.then(function() { return results; });
      }
    }
  ]
});
