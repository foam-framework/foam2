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
  name: 'AxiomArray',
  extends: 'Property',

  documentation: 'An Array of Axioms (used by Model) whose elements are added to this.axioms_.',

  properties: [
    {
      name: 'of',
      required: true
    },
    [ 'type', 'Any[]' ],
    {
      name: 'adapt',
      value: function(_, a, prop) {
        if ( ! Array.isArray(a) ) return a;

        var copy;
        for ( var i = 0 ; i < a.length ; i++ ) {
          var b = prop.adaptArrayElement.call(this, a[i], prop);
          if ( b !== a[i] ) {
            if ( ! copy ) copy = a.slice();
            copy[i] = b;
          }
        }

        return copy || a;
      }
    },
    {
      name: 'assertValue',
      value: function(v, prop) {
        foam.assert(Array.isArray(v),
            'Tried to set', prop.name, 'to non array value');

        var of = this.__context__.lookup(prop.of, true);
        foam.assert(
            of,
            'Unknown "of" Model in AxiomArray: property=',
            prop.name,
            ' of=',
            prop.of);
        for ( var i = 0 ; i < v.length ; i++ ) {
          foam.assert(of.isInstance(v[i]),
              'Element', i, 'of', prop.name, 'is not an instance of', prop.of,
              'at', this.package + '.' + this.name, '[', v[i].name, ']');
        }
      }
    },
    {
      name: 'adaptArrayElement',
      value: function(a, prop) {
        if ( a.class ) {
          var m = this.__context__.lookup(a.class);
          if ( ! m ) throw 'Unknown class : ' + a.class;
          return m.create(a, this);
        }

        var of = this.__context__.lookup(prop.of);
        return of.isInstance(a) ? a : of.create(a, this);
      }
    },
    [ 'postSet', function(_, a) { this.axioms_.push.apply(this.axioms_, a); } ]
  ]
});
