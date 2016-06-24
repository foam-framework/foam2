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
          if ( a ) this.doSub();
          else this.doUnsub();
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
      this.onDestroy(function() {
        this.subscription && this.subscription.destroy();

        if ( this.parent ) {
          this.parent.removeChild(this);
          this.parent.active = true;
        }
      }.bind(this));
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
      class: 'Function',
      name: 'code',
      expression: function(name, property, returns, delegate) {
        if ( delegate ) {
          return function() {
            return this[property][name].apply(this, arguments);
          };
        }
        return function() {
          return this[property][name].apply(this[property], arguments);
        };
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
        return function(a1) {
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


// TODO(adamvy): document
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
      name: 'forwards'
      //documentation: 'Methods that are forwarded to the proxies object.'
    },
    {
      class: 'StringArray',
      name: 'delegates'
      //documentation: 'Methods that are delegated to the proxied object.'
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
          property: name
        }));
      }

      for ( var i = 0 ; i < delegates.length ; i++ ) {
        var method = delegates[i];
        axioms.push(foam.core.ProxiedMethod.create({
          name: method.name,
          returns: method.returns,
          property: name,
          delegate: true
        }));
      }

      axioms.push(foam.core.ProxySub.create({
        topics: this.topics,
        prop: this.name
      }));

      cls.installAxioms(axioms);
    }
  ]
});
