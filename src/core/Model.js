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

/** Class/Prototype description. */
foam.CLASS({
  package: 'foam.core',
  name: 'Model',
  extends: 'FObject', // Isn't the default yet.

  // documentation: 'Class/Prototype description.',

  properties: [
    {
      name: 'id',
      getter: function() {
        return this.package ? this.package + '.' + this.name : this.name;
      }
    },
    'package',
    'abstract',
    'name',
    {
      // Just discard documentation.
      // If it's needed, a real 'documentation' property will
      // be refined in.
      name: 'documentation',
      setter: function() { }
    },
    {
      name: 'label',
      expression: function(name) { return foam.String.labelize(name); }
    },
    [ 'extends', 'FObject' ],
    'refines',
    {
      // List of all axioms, including methods, properties, listeners,
      // etc. and 'axioms'.
      name: 'axioms_',
      factory: function() { return []; }
    },
    {
      // List of extra axioms. Is added to axioms_.
      name: 'axioms',
      factory: function() { return []; },
      postSet: function(_, a) { this.axioms_.push.apply(this.axioms_, a); }
    },
    {
      // Is replaced by an AxiomArray later.
      class: 'Array',
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
          var m = foam.lookup(o.class);
          if ( ! m ) throw 'Unknown class : ' + o.class;
          return m.create(o);
        }

        return foam.core.Property.create(o);
      }
    },
    {
      // Is replaced by an AxiomArray later.
      class: 'Array',
      of: 'Method',
      name: 'methods',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Method must be named');
          var m = foam.core.Method.create();
          m.name = o.name;
          m.code = o;
          return m;
        }
        return foam.core.Method.create(o);
      }
    }
  ],

  methods: [ foam.boot.buildClass ]
});
