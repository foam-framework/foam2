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
 * foam.__context__ references the root context, which is the ancestor of all other
 * contexts.
 */

(function() {
  var __context__ = {
    // Temporary: gets replaced in Window.js.
    assert: function(b) { console.assert.apply(console, arguments); return b; },

    /**
     * Lookup a class in the context.  Throws an exception if the value
     * couldn't be found, unless opt_suppress is true.
     *
     * @param id The id of the class to lookup.
     * @param opt_suppress Suppress throwing an error.
     **/
    lookup: function(id, opt_suppress) {
      var ret = typeof id === 'string' && this.__cache__[id];

      if ( ! opt_suppress ) {
        console.assert(
            ret,
            'Could not find any registered class for ' + id);
      }

      return ret;
    },

    /**
     * Register a class into the given context.  After registration
     * the class can be found again by calling foam.lookup('com.foo.SomeClass');
     *
     * @param cls The class to register.
     */
    register: function(cls, opt_id) {
      console.assert(
        typeof cls === 'object',
        'Cannot register non-objects into a context.');

      function doRegister(cache, name) {
        console.assert(
          cache.hasOwnProperty(name) === false,
          cls.id + ' is already registerd in this context.');

        cache[name] = cls;
      }

      if ( opt_id ) {
        doRegister(this.__cache__, opt_id);
      } else {
        console.assert(
            typeof cls.id === 'string',
            'Must have an .id property to be registered in a context.');
        doRegister(this.__cache__, cls.id);
        if ( cls.package === 'foam.core' ) doRegister(this.__cache__, cls.name);
      }
    },

    /**
     * Creates a sub context of the context that this is called upon.
     * @param opt_args A map of bindings to set up in the sub context.
     *     Currently unused.
     */
    createSubContext: function createSubContext(opt_args, opt_name) {
      console.assert(opt_name === undefined || typeof opt_name === 'string',
                     'opt_name must be left undefined or be a string.');

      var sub = {};

      if ( opt_name ) {
        Object.defineProperty(sub, 'NAME', {
          value: opt_name, enumerable: false
        });
      }

      for ( var key in opt_args ) {
        if ( opt_args.hasOwnProperty(key) ) {
          var v = opt_args[key];

          if ( foam.core.Slot.isInstance(v) ) {
            sub[key + '$'] = v;
            // For performance, these could be reused.
            (function(v) {
              Object.defineProperty(sub, key, {
                get: function() { return v.get(); },
                enumerable: false
              });
            })(v);
          } else {
            sub[key + '$'] = foam.core.ConstantSlot.create({value: v});
            sub[key] = v;
          }
        }
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

  Object.defineProperty(__context__, '__cache__', {
    value: {},
    enumerable: false
  });

  // Create short-cuts for foam.__context__.[createSubContext, register, lookup]
  // in foam.
  foam.lookup = function(id, opt_suppress) {
    return foam.__context__.lookup(id, opt_suppress);
  };
  foam.register = function(cls) { foam.__context__.register(cls); };
  foam.createSubContext = function(opt_args, opt_name) {
    return foam.__context__.createSubContext(opt_args, opt_name);
  };

  foam.__context__ = __context__;
})();
