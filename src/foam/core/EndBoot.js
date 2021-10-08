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
 * Map of Property property names to arrays of names of properties that they shadow.
 *
 * Ex. 'setter' has higher precedence than 'adapt', 'preSet', and 'postSet', so if
 * it is set, then it shadows those other properties if they are set, causing their
 * values to be ignored.
 *
 * Not defined as a constant, because they haven't been defined yet.
 */
foam.core.Property.SHADOW_MAP = {
  setter:     [ 'adapt', 'preSet', 'postSet' ],
  getter:     [ 'factory', 'expression', 'value' ],
  factory:    [ 'expression', 'value' ],
  expression: [ 'value' ]
};

/** Add new Axiom types (Implements, Constants, Topics, Properties, Methods and Listeners) to Model. */
foam.CLASS({
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      of: 'Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var p = foam.core.Property.create();
          p.name = o;
          return p;
        }

        if ( Array.isArray(o) ) {
          var p = foam.core.Property.create();
          p.name  = o[0];
          p.value = o[1];
          return p;
        }

        if ( o.class ) {
          var m = this.__context__.lookup(o.class);
          if ( ! m ) throw 'Unknown class : ' + o.class;
          return m.create(o, this);
        }

        return foam.core.Property.isInstance(o) ? o : foam.core.Property.create(o);
      }
    },
    {
      class: 'AxiomArray',
      of: 'Method',
      name: 'methods',
      adaptArrayElement: function(o, prop) {
        if ( typeof o === 'function' ) {
          var name = foam.Function.getName(o);
          foam.assert(name, 'Method must be named');
          var m = this.__context__.lookup(prop.of).create();
          m.name = name;
          m.code = o;
          return m;
        }
        if ( this.__context__.lookup(prop.of).isInstance(o) ) return o;
        if ( o.class ) return this.__context__.lookup(o.class).create(o, this);
        return foam.lookup(prop.of).create(o);
      }
    },
    {
      class: 'String',
      name: 'plural',
      expression: function(name) {
        return foam.String.pluralize(name);
      }
    }
  ]
});


foam.boot.phase3();


foam.CLASS({
  refines: 'foam.core.FObject',

  documentation: 'Upgrade FObject to fully bootstraped form.',

  axioms: [
    {
      name: '__context__',
      installInProto: function(p) {
        Object.defineProperty(p, '__context__', {
          get: function() {
            var x = this.getPrivate_('__context__');
            if ( ! x ) {
              var contextParent = this.getPrivate_('contextParent');
              if ( contextParent ) {
                this.setPrivate_(
                    '__context__',
                    x = contextParent.__subContext__ || contextParent.__context__);
                this.setPrivate_('contextParent', undefined);
              } else {
                // Happens during bootstrap with Properties.
                x = foam.__context__;
              }
            }
            return x;
          },
          set: function(x) {
            if ( x ) {
              // Set either contextParent or __context__, depending on if x is
              // an FObject or Context
              this.setPrivate_(
                foam.core.FObject.isInstance(x) ?
                    'contextParent' :
                    '__context__',
                x);
            }
          }
        });

        // If no delcared exports, then sub-context is the same as context.
        Object.defineProperty(
            p,
            '__subContext__',
            {
              get: function() { return this.__context__; },
              set: function() {
                throw new Error(
                  'Attempted to set unsettable __subContext__ in ' +
                  this.cls_.id);
              }
            });
      }
    }
  ],

  methods: [
    /**
      Called to process constructor arguments.
      Replaces simpler version defined in original FObject definition.
    */
    function initArgs(args, ctx) {
      if ( ctx  ) this.__context__ = ctx;
      if ( args ) this.copyFrom(args, true);
    },

    /**
      Template method used to report an unknown argument passed
      to a constructor. Is set in debug.js.
    */
    function unknownArg(key, value) {
      // NOP
    }
  ]
});

foam.boot.end();


/**
  Refine foam.core.Property to add 'transient' support.

  A transient Property is not intended to be persisted
  or transfered over the network.

  Ex. A computed Property could be made transient to avoid
  wasting disk space or network bandwidth.

  For finer control, there are also separate properties called
  'networkTransient' and 'storageTransient', which default to
  the value of 'transient' if not explicitly set.

  A networkTransient field is not marshalled over network calls.
  foam.json.Network does not encode networkTransient fields.

  A storageTransient field is not stored to persistent storage.
  foam.json.Storage does not encode storageTransient fields.

  A storageOptional field is not stored to persistent storage if
  if it is the only field to be persisted, or the only fields to
  be persisted are all storageOptional.

  A clusterTransient field is not marshalled over the network to the primary/master node.
  foam.json.Cluster does not encode clusterTransient fields.
 */
foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'Boolean',
      name: 'transient'
    },
    {
      class: 'Boolean',
      name: 'networkTransient',
      expression: function(transient) {
        return transient;
      }
    },
    {
      class: 'Boolean',
      name: 'externalTransient',
      expression: function(transient) {
        return transient;
      }
    },
    {
      class: 'Boolean',
      name: 'storageTransient',
      expression: function(transient) {
        return transient;
      }
    },
    {
      class: 'Boolean',
      name: 'storageOptional'
    },
    {
      class: 'Boolean',
      name: 'clusterTransient',
      expression: function(transient) {
        return transient;
      }
    }
  ]
});


/**
 * Some final adjustments.
 *
 * Make foam.CLASS lazy so it only builds models and classes when
 * first accessed.  Also make refinements lazy, so they only trigger
 * when the class being refined is first referenced.
 *
 * Track definitions of LIBs and SCRIPTs
 *
 * Also track the order in which Classes, Scripts and Libraries are defined.
 */
(function() {
  // Track libraries and scripts created after boot
  foam.__count = 0;

  foam.__LIBS__ = [];
  foam.__SCRIPTS__ = [];

  var foamLIB = foam.LIB;
  foam.LIB = function(model) {
    foam.__LIBS__.push(model);
    foamLIB(model);
    model.order = foam.__count++;
  };

  var foamSCRIPT = foam.SCRIPT;
  foam.SCRIPT = function(model) {
    foam.__SCRIPTS__.push(model);
    foamSCRIPT(model);
    model.order = foam.__count++;
  };

  // List of unused Models in the system.
  foam.USED      = {};
  foam.UNUSED    = {};

  var CLASS = foam.CLASS;

  foam.CLASS = function(m) {
    if ( ! m.source && global.document && global.document.currentScript ) {
      m.source = global.document.currentScript.src;
    }

    if ( ! m.name ) throw new Error("Unnamed model" + m.refines);

    m.order = foam.__count++;
    m.id = m.package ? m.package + '.' + m.name : m.name;

    foam.UNUSED[m.id] = m;

    if ( m.refines ) {
      if ( foam.__context__.isDefined(m.refines) ) {
        delete foam.UNUSED[m.id];
        CLASS(m);
        foam.USED[m.id] = m;
      } else {
        foam.pubsub.sub("defineClass", m.refines, function(s) {
          s.detach();
          delete foam.UNUSED[m.id];
          CLASS(m);
          foam.USED[m.id] = m;
        });
      }
      return;
    }

    var f = foam.Function.memoize0(function() {
      delete foam.UNUSED[m.id];
      var c = CLASS(m);
      foam.USED[m.id] = m;
      return c;
    });

    foam.__context__.registerFactory(m, f);
  };
})();
