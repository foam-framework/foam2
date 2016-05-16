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
  Imports and Exports provide implicit Context dependency management.

  A class can list which values it requires from the Context, and then
  these values will be added to the object itself so that it doesn't need
  to explicitly work with the Context.

  A class can list which values (properties, methods, or method-like axioms)
  that it exports, and these will automatically be added to the object's
  sub-Context. The object's sub-Context is the context that is used when
  new objects are created by the object.

  Ex.:
<pre>
foam.CLASS({
  name: 'ImportsTest',

  imports: [ 'log', 'warn' ],

  methods: [ function foo() {
    this.log('log foo from ImportTest');
    this.warn('warn foo from ImportTest');
  } ]
});

foam.CLASS({
  name: 'ExportsTest',
  requires: [ 'ImportsTest' ],

  exports: [ 'log', 'log as warn' ],

  methods: [
    function init() {
      // ImportsTest will be created in ExportTest's
      // sub-Context, which will have 'log' and 'warn'
      // exported.
      this.ImportsTest.create().foo();
    },
    function log(msg) {
      console.log('log:', msg);
    }
  ]
});
</pre>

  Aliasing:
    Bindings can be renamed or aliased when they're imported or exported using 'as alias'.

  Examples:
    // import 'userDAO' from the Context and make available as this.dao
    imports: [ 'userDAO as dao' ]

    // export my log method as 'warn'
    exports: [ 'log as warn' ]

    // If the axiom to be exported isn't named, but just aliased, then 'this' is exported
    // as the named alias.  This is how objects export themselves.
    exports: [ 'as Controller' ]

  See Context.js.
 */
foam.CLASS({
  package: 'foam.core',
  name: 'Imports',

  // documentation: 'Import Context Value Axiom',

  properties: [
    'name',
    'key',
    {
      name: 'slotName_',
      factory: function() { return this.name + '$'; }
    }
  ],

  methods: [
    function installInProto(proto) {
      var name     = this.name;
      var key      = this.key;
      var slotName = this.slotName_;

      Object.defineProperty(proto, slotName, {
        get: function importsGetter() {
          if ( ! this.hasOwnPrivate_(slotName) ) {
            var X = this.__context__ || foam.__context__;
            this.setPrivate_(slotName, X[key + '$']);
          }

          return this.getPrivate_(slotName);
        },
        configurable: true,
        enumerable: false
      });

      Object.defineProperty(proto, name, {
        get: function importsGetter()  { return this[slotName].get(); },
        set: function importsSetter(v) { this[slotName].set(v); },
        configurable: true,
        enumerable: false
      });
    },

    function toSlot(obj) {
      return obj[this.slotName_];
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Exports',

  // documentation: 'Export Sub-Context Value Axiom',

  properties: [
    [ 'name', 'exports_' ],
    {
      name: 'bindings',
      adapt: function(_, bs) {
        for ( var i = 0 ; i < bs.length ; i++ ) {
          var b = bs[i];
          if ( typeof b === 'string' ) {
            var key, name, a = b.split(' ');
            switch ( a.length ) {
              case 1:
                key = name = a[0];
              break;
              case 2:
                console.assert(a[0] === 'as', 'Invalid export syntax: key [as value] | as value');
                name = a[1]; // signifies 'this'
                key  = null;
              break;
              case 3:
                console.assert(a[1] === 'as', 'Invalid export syntax: key [as value] | as value');
                name = a[2];
                key  = a[0];
              break;
              default:
                console.error('Invalid export syntax: key [as value] | as value');
            }
            bs[i] = { name: name, key: key };
          }
        }
        return bs;
      }
    }
  ],

  methods: [
    function installInProto(proto) {
      var bs = this.bindings;

      Object.defineProperty(proto, '__subContext__', {
        get: function YGetter() {
          if ( ! this.hasOwnPrivate_('__subContext__') ) {
            var X = this.__context__ || foam.__context__;
            var m = {};
            for ( var i = 0 ; i < bs.length ; i++ ) {
              var b = bs[i];

              if ( b.key ) {
                var a = this.cls_.getAxiomByName(b.key);

                if ( ! a ) {
                  console.error(
                    'Unknown export: "' +
                      b.key +
                      '" in model: ' +
                      this.cls_.id);
                }

                // Axioms have an option of wrapping a value for export.
                // This could be used to bind a method to 'this', for example.
                m[b.name] = a.exportAs ? a.exportAs(this) : this[b.key] ;
              } else {
                // Ex. 'as Bank', which exports an implicit 'this'
                m[b.name] = this;
              }
            }
            this.setPrivate_('__subContext__', X.subContext(m));
          }

          return this.getPrivate_('__subContext__');
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'Imports',
      name: 'imports',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var a = o.split(' as ');
          return foam.core.Imports.create({name: a[1] || a[0], key: a[0]});
        }

        return foam.core.Imports.create(o);
      }
    },
    {
      name: 'exports',
      postSet: function(_, xs) {
        this.axioms_.push.call(
          this.axioms_,
          foam.core.Exports.create({bindings: xs}));
      }
    }
  ]
});
