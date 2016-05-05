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
            var X = this.X || foam.X;
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

      Object.defineProperty(proto, 'Y', {
        get: function YGetter() {
          if ( ! this.hasOwnPrivate_('Y') ) {
            var X = this.X || foam.X;
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
