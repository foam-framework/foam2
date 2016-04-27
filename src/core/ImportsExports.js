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

// TODO: doc
foam.CLASS({
  package: 'foam.core',
  name: 'Imports',

  // documentation: 'Import Context Value Axiom',

  properties: [
    // TODO: renamed 'as' to 'name' for error detection
    { name: 'name', getter: function() { return 'imports_' + this.key; } },
    'key',
    'as'
  ],

  methods: [
    function installInProto(proto) {
      var key      = this.key;
      var as       = this.as;
      // TODO: make a property
      var slotName = this.slotName_ = as + '$';

      Object.defineProperty(proto, slotName, {
        get: function importsGetter() {
          if ( ! this.hasOwnPrivate_(slotName) ) {
            var X = this.X || foam;
            this.setPrivate_(slotName, X[key + '$']);
          }

          return this.getPrivate_(slotName);
        },
        configurable: true,
        enumerable: false
      });

      Object.defineProperty(proto, as, {
        get: function importsGetter() {
          return this[slotName].get();
        },
        set: function importsSetter(v) {
          this[slotName].set(v);
        },
        configurable: true,
        enumerable: false
      });
    },

    function toSlot(obj) {
      return obj[this.slotName_];
    }
  ]
});


// TODO: move above imports
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
            var key, as, a = b.split(' ');
            switch ( a.length ) {
              case 1:
                key = as = a[0];
              break;
              case 2:
                console.assert(a[0] === 'as', 'Invalid export syntax: key [as value] | as value');
                key = null;
                as  = a[1]; // signifies 'this'
              break;
              case 3:
                console.assert(a[1] === 'as', 'Invalid export syntax: key [as value] | as value');
                key = a[0];
                as  = a[2];
              break;
              default:
                console.error('Invalid export syntax: key [as value] | as value');
            }
            bs[i] = [ key, as ];
          }
        }
        return bs;
      }
    }
  ],

  methods: [
    function installInProto(proto) {
      var bs = this.bindings;

      Object.defineProperty(proto, 'Y', {
        get: function YGetter() {
          if ( ! this.hasOwnPrivate_('Y') ) {
            var X = this.X || foam;
            var m = {};
            for ( var i = 0 ; i < bs.length ; i++ ) {
              var b = bs[i];

              if ( b[0] ) {
                var a = this.cls_.getAxiomByName(b[0]);

                if ( ! a ) {
                  console.error('Unknown export: "' + b[0] + '" in model: ' + this.cls_.id);
                }

                // Axioms have an option of wrapping a value for export.
                // This could be used to bind a method to 'this', for example.
                m[b[1]] = a.exportAs ? a.exportAs(this) : this[b[0]] ;
              } else {
                // Ex. 'as Bank', which exports an implicit 'this'
                m[b[1]] = this;
              }
            }
            this.setPrivate_('Y', X.subContext(m));
          }

          return this.getPrivate_('Y');
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});
