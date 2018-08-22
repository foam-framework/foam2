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

foam.SCRIPT({
  package: 'foam.core',
  name: 'ContextScript',
  requires: [
    'foam.core.ConstantSlot',
  ],
  code: function() {

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
        foam.assert(
            ret,
            'Could not find any registered class for ' + id);
      }

      return foam.Function.isInstance(ret) ? ret() : ret;
    },

    /**
     * Register a class into the given context.  After registration
     * the class can be found again by calling foam.lookup('com.foo.SomeClass');
     *
     * @param cls    The class to register.
     * @param opt_id Optional id under which to register class.
     */
    register: function(cls, opt_id) {
      foam.assert(
        typeof cls === 'object',
        'Cannot register non-objects into a context.');

      if ( opt_id ) {
        this.registerInCache_(cls, this.__cache__, opt_id);
      } else {
        foam.assert(
            typeof cls.id === 'string',
            'Must have an .id property to be registered in a context.');

        this.registerInCache_(cls, this.__cache__, cls.id);

        if ( cls.package === 'foam.core' ) {
          this.registerInCache_(cls, this.__cache__, cls.name);
        }
      }
    },

    /**
     * Register a class factory into the given context.
     * When the class is first accessed the factory is used
     * to create the value which is used.
     */
    registerFactory: function(m, factory) {
      foam.assert(
        typeof m.id === 'string',
        'Must have an .id property to be registered in a context.');

      this.registerInCache_(factory, this.__cache__, m.id);

      if ( m.package === 'foam.core' ) {
        this.registerInCache_(factory, this.__cache__, m.name);
      }
    },

    /**
     * Returns true if the model ID has been registered. False otherwise.
     */
    isRegistered: function(modelId) {
      return !! this.__cache__[modelId];
    },

    /** Internal method to register a context binding in an internal cache */
    registerInCache_: function registerInCache_(cls, cache, name) {
      var hasOld = Object.prototype.hasOwnProperty.call(cache, name);
      var old = cache[name];

      // Okay to replace a function with an actual class.
      // This happens after a lazy class is initialized.
      foam.assert(
          ! hasOld ||
              (foam.Function.isInstance(old) && ! foam.Function.isInstance(cls)),
          name + ' is already registered in this context.');

      cache[name] = cls;
    },

    /** Internal method to create a slot name for a specified key. */
    toSlotName_: foam.Function.memoize1(function toSlotName_(key) {
      return key + '$';
    }),

    /**
     * Creates a sub context of the context that this is called upon.
     * @param opt_args A map of bindings to set up in the sub context.
     *     Currently unused.
     */
    createSubContext: function createSubContext(opt_args, opt_name) {
      if ( ! opt_args ) return this;

      foam.assert(
          opt_name === undefined || typeof opt_name === 'string',
          'opt_name must be left undefined or be a string.');

      var sub = Object.create(this);

      if ( opt_name ) {
        Object.defineProperty(sub, 'NAME', {
          value: opt_name,
          enumerable: false
        });
      }

      for ( var key in opt_args ) {
        if ( opt_args.hasOwnProperty(key) ) {
          var v = opt_args[key];

          if ( ! foam.core.Slot.isInstance(v) ) {
            Object.defineProperty(sub, this.toSlotName_(key), {
              value: foam.core.ConstantSlot.create({ value: v }),
              enumerable: true
            });

            Object.defineProperty(sub, key, {
              value: v,
              enumerable: true
            });
          } else {
            Object.defineProperty(sub, this.toSlotName_(key), {
              value: v,
              enumerable: true
            });

            (function(v) {
              Object.defineProperty(sub, key, {
                get: function() { return v.get(); },
                enumerable: true
              });
            })(v);
          }
        }
      }

      Object.defineProperty(sub, '__cache__', {
        value: Object.create(this.__cache__),
        enumerable: false
      });

      foam.Object.freeze(sub);

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
  foam.register = function(cls, opt_id) {
    foam.__context__.register(cls, opt_id);
  };
  foam.createSubContext = function(opt_args, opt_name) {
    return foam.__context__.createSubContext(opt_args, opt_name);
  };

  foam.__context__ = __context__;
})();

  }
});
