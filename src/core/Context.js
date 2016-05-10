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

// TODO: __context__, __subContext__

/**
 * Context Support
 *
 * Contexts, also known as frames, scopes or environments, are used to store
 * named resources. They provide an object-oriented replacement for global
 * variables. Contexts are immutable. New bindings are added by creating
 * "sub-contexts" with new bindings, from an existing parent context.
 * Sub-contexts inherit bindings from their parent.
 *
 * Contexts provide a form of inversion-of-control or dependendency-injection.
 * Normally, contexts are not explicitly used because FOAM's imports/exports
 * mechanism provides a high-level declarative method of dependency management
 * which hides their use.
 *
 * foam.X references the root context, which is the ancestor of all other
 * contexts.
 */

(function() {
  var X = {
    // Temporary: gets replaced in Window.js.
    assert: function() { console.assert.apply(console, arguments); },

    // TODO: add second disableException option
    /** Lookup a Model. **/
    lookup: function(id) {
      return this.__cache__[id];
    },

    register: function(cls) {
      console.assert(
        typeof cls === 'object',
        'Cannot register non-objects into a context.');
      console.assert(
        typeof cls.id === 'string',
        'Must have an .id property to be registered in a context.');

      function doRegister(cache, name) {
        // FUTURE: Re-enable when we have a good plan for unloading classes
        // console.assert(
        //     ! cache.hasOwnProperty(name),
        //     cls.id + ' is already registerd in this context.');

        cache[name] = cls;
      }

      doRegister(this.__cache__, cls.id);
      if ( cls.package === 'foam.core' ) doRegister(this.__cache__, cls.name);
    },

    subContext: function subContext(opt_args, opt_name) {
      var sub = {};

      for ( var key in opt_args ) {
        if ( opt_args.hasOwnProperty(key) ) {
          var v = opt_args[key];

          if ( foam.core.Slot.isInstance(v) ) {
            sub[key + '$'] = v;
            // For performance, these could be reused.
            Object.defineProperty(sub, key, {
              get: function() { return v.get(); },
              enumerable: false
            });
          } else {
            sub[key + '$'] = foam.core.ConstantSlot.create({value: v});
            sub[key] = v;
          }
        }
      }

      if ( opt_name ) {
        Object.defineProperty(sub, 'NAME', {value: opt_name, enumerable: false});
      }
      Object.defineProperty(sub, '__cache__', {
        value: Object.create(this.__cache__),
        enumerable: false
      });

      sub.$UID__ = foam.next$UID();
      sub.__proto__ = this;
      Object.freeze(sub);

      return sub;
    }
  };

  Object.defineProperty(X, '__cache__', {
    value: {},
    enumerable: false
  });

  foam.lookup = function(id) { return foam.X.lookup(id); };
  foam.register = function(cls) { foam.X.register(cls); };
  foam.subContext = function(opt_args, opt_name) {
    return foam.X.subContext(opt_args, opt_name);
  };

  foam.X = X;
})();
