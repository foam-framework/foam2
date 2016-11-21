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

/**
 * The Proxy axiom enables your class to automatically proxy methods of
 * an interface to a delegate object.
 *
 * It is an implementation of the Proxy design pattern.
 *
 * The Proxy axiom itself is a property which holds the delegate object
 * that we are proxying.  It also installs a number of Method axioms onto
 * the target class, which proxy all the the specific methods of the interface
 * being proxied.
 *
 * Currently only methods are proxied.
 *
 * USAGE:
 *
 * foam.CLASS({
 *   name: 'Abc',
 *   methods: [
 *     function foo() {
 *       console.log("foo");
 *     }
 *   ]
 * });
 *
 * foam.CLASS({
 *   name: 'ProxyAbc',
 *   properties: [
 *     {
 *       class: 'Proxy',
 *       of: 'Abc'
 *       name: 'delegateAbc'
 *     }
 *   ]
 * });
 *
 * var a = ProxyAbc.create({ delegateAbc: Abc.create() });
 * a.foo();
 *
 * will output:
 *
 * "foo"
 *
 *
 * Methods can be forwarded or delegated to the proxied object.
 * Forwarded methods are the simple case:
 *
 * function foo() {
 *   // This is what a forwarded method looks like
 *   this.delegateAbc.foo();
 * }
 *
 * Delegated methods call the proxied object's implementation
 * but keep "this" as the same object.
 *
 * If the foo method was delegated it would look like this:
 *
 * function foo() {
 *   this.delegateAbc.foo.call(this);
 * }
 *
 * FUTURE(adamvy): Support proxying properties?
 * TODO(adamvy): Document how topics are proxied once the implementation is settled.
 */
// NB: Extending a Proxied object and unsetting options (like setting
//     topics: []) will not undo the work the base class has already done.
//     The ProxySub is already installed in the prototype and will still
//     be active in the derived class, even though it appears that topics is
//     not proxied when examining the dervied class' axiom.
foam.CLASS({
  package: 'foam.core',
  name: 'Proxy',
  extends: 'Property',

  properties: [
    { name: 'of', required: true },
    {
      class: 'StringArray',
      name: 'topics'
    },
    {
      class: 'StringArray',
      name: 'forwards',
      factory: null,
      value: null
      //documentation: 'Methods that are forwarded to the proxies object.'
    },
    {
      class: 'StringArray',
      name: 'delegates',
      factory: null,
      value: null
      //documentation: 'Methods that are delegated to the proxied object.'
    },
    {
      name: 'fromJSON',
      value: function(json, ctx) {
        return foam.json.parse(json, null, ctx);
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      this.SUPER(cls);

      var name     = this.name;
      var delegate = foam.lookup(this.of);

      function resolveName(name) {
        var m = delegate.getAxiomByName(name);
        foam.__context__.assert(foam.core.Method.isInstance(m), 'Cannot proxy non-method', name);
        return m;
      }

      var delegates = this.delegates ? this.delegates.map(resolveName) : [];

      var forwards = this.forwards ?
          this.forwards.map(resolveName) :
          // TODO(adamvy): This isn't the right check.  Once we have modeled interfaces
          // we can proxy only that which is defined in the interface.
          delegate.getOwnAxiomsByClass(foam.core.Method);

      var axioms = [];
      for ( var i = 0 ; i < forwards.length ; i++ ) {
        var method = forwards[i];
        axioms.push(foam.core.ProxiedMethod.create({
          name: method.name,
          returns: method.returns,
          property: name,
          args: method.args
        }));
      }

      for ( var i = 0 ; i < delegates.length ; i++ ) {
        var method = delegates[i];
        axioms.push(foam.core.ProxiedMethod.create({
          name: method.name,
          returns: method.returns,
          property: name,
          args: method.args,
          delegate: true
        }));
      }

      if ( ! this.topics || this.topics.length ) {
        axioms.push(foam.core.ProxySub.create({
          topics: this.topics,
          prop:   this.name
        }));
      }

      cls.installAxioms(axioms);
    }
  ]
});

/**
 * ProxiedMethod is a type of method that delegates or forwards calls
 * to a delegate object.  It is used as an implementation detail of the
 * Proxy axiom
 *
 * Delegation means that the delegate object's implementation is called with
 * "this" still being the original object.
 *
 * Forwarding means that the method call is simply "forwarded" to the delegate
 * object.  "this" will be the delegate object.
 */
foam.CLASS({
  package: 'foam.core',
  name: 'ProxiedMethod',
  extends: 'Method',

  properties: [
    {
      class: 'String',
      name: 'property'
    },
    {
      class: 'Boolean',
      name: 'delegate',
      value: false
    },
    {
      name: 'code',
      expression: function(name, property, returns, delegate) {
        return delegate ?
            function delegate() {
              return this[property][name].apply(this, arguments);
            } :
            function forward() {
              return this[property][name].apply(this[property], arguments);
            } ;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'EventProxy',

  properties: [
    {
      name: 'dest'
    },
    {
      name: 'topic',
      factory: function() { return []; }
    },
    {
      class: 'Boolean',
      name: 'active',
      value: false,
      postSet: function(old, a) {
        for ( var key in this.children ) {
          this.children[key].active = ! a;
        }

        if ( old !== a ) {
          if ( a ) {
            this.doSub();
          } else {
            this.doUnsub();
          }
        }
      }
    },
    {
      name: 'parent'
    },
    {
      name: 'children',
      factory: function() {
        return {};
      }
    },
    {
      name: 'src',
      postSet: function(o, src) {
        if ( this.active ) this.doSub();
        for ( var key in this.children ) {
          this.children[key].src = src;
        }
      }
    },
    {
      name: 'subscription'
    }
  ],

  methods: [
    function init() {
      this.onDestroy(foam.Function.bind(function() {
        this.subscription && this.subscription.destroy();

        if ( this.parent ) {
          this.parent.removeChild(this);
          this.parent.active = true;
        }
      }, this));
    },

    function doSub() {
      if ( this.subscription ) this.subscription.destroy();

      if ( ! this.src ) return;

      var args = this.topic.slice()
      args.push(this.onEvent);
      this.subscription = this.src.sub.apply(this.src, args);
    },

    function doUnsub() {
      if ( this.subscription ) this.subscription.destroy();
    },

    function removeChild(c) {
      for ( var key in this.children ) {
        if ( this.children[key] === c ) {
          delete this.children[key];
          return;
        }
      }
    },

    function getChild(key) {
      if ( ! this.children[key] ) {
        this.children[key] = this.cls_.create({
          parent: this,
          dest: this.dest,
          src: this.src,
          topic: this.topic.slice().concat(key)
        });
      }
      return this.children[key];
    },

    function addProxy(topic) {
      var c = this;
      var active = true;
      for ( var i = 0 ; i < topic.length ; i++ ) {
        active = active && ! c.active;
        c = c.getChild(topic[i]);
      }

      c.active = active;
    }
  ],

  listeners: [
    function onEvent(s) {
      if ( this.active ) {
        var args = foam.Function.appendArguments([], arguments, 1);
        var c = this.dest.pub.apply(this.dest, args);
        if ( ! c ) this.destroy();
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'ProxySub',
  extends: 'Method',

  properties: [
    {
      name: 'name',
      getter: function() {
        return 'sub';
      }
    },
    {
      class: 'String',
      name: 'prop'
    },
    {
      class: 'StringArray',
      name: 'topics'
    },
    {
      name: 'code',
      expression: function(prop, topics) {
        var privateName = prop + 'EventProxy_';
        return function subProxy(a1) {
          if ( ! topics || topics.indexOf(a1) != -1 ) {
            var proxy = this.getPrivate_(privateName);
            if ( ! proxy ) {
              proxy = foam.core.EventProxy.create({
                dest: this,
                src: this[prop]
              });
              this.setPrivate_(privateName, proxy);

              proxy.src$.follow(this.slot(prop));
            }

            proxy.addProxy(Array.from(arguments).slice(0, -1));
          }

          return this.SUPER.apply(this, arguments);
        };
      }
    }
  ]
});
