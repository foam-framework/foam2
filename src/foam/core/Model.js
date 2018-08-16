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

/** Class/Prototype description. */
foam.CLASS({
  package: 'foam.core',
  name: 'Model',

  documentation: 'A Class Model (description).',

  properties: [
    {
      name: 'id',
      hidden: true,
      transient: true,
      getter: function() {
        if ( this.refines && ! this.name ) {
          // No ID for the refinement so give it one. These names should be
          // consistent regardless of how this is being run (e.g. node, web,
          // debug, etc) so the first axiom name is used.
          var n = new RegExp('(.*)\\.(.*)?$').exec(this.refines)
          var p = n ? n[1] : 'foam.core';
          n = (n ? n[2] : this.refines) + 'Refines';
          if ( this.axioms_.length ) {
            n = n + this.axioms_[0].name;
          }
          return p + '.' + n;
        }
        return this.package ? this.package + '.' + this.name : this.name;
      }
    },
    'package',
    'abstract',
    'name',
    {
      name: 'flags',
      documentation: `
        When set, marks the model with the given flags. This can be used for
        things like stripping out platform specific models when building.
      `,
    },
    {
      name: 'label',
      expression: function(name) { return foam.String.labelize(name); }
    },
    [ 'extends', 'FObject' ],
    'refines',
    { name: 'documentation', adapt: function(_, d) { return typeof d === 'function' ? foam.String.multiline(d).trim() : d; } },
    {
      // List of all axioms, including methods, properties, listeners,
      // etc. and 'axioms'.
      name: 'axioms_',
      transient: true,
      hidden: true,
      factory: function() { return []; }
    },
    {
      // List of extra axioms. Is added to axioms_.
      name: 'axioms',
      hidden: true,
      factory: function() { return []; },
      postSet: function(_, a) { this.axioms_.push.apply(this.axioms_, a); },
      adapt: function(_, v) {
        if ( ! Array.isArray(v) ) return v;
        var copy;
        for ( var i = 0 ; i < v.length ; i++ ) {
          if ( v[i].class ) {
            if ( ! copy ) copy = v.slice();
            copy[i] = foam.lookup(v[i].class).create(v[i]);
          }
        }
        return copy || v;
      }
    },
    {
      // Is upgraded to an AxiomArray later.
      of: 'Property',
      name: 'properties'
    },
    {
      // Is upgraded to an AxiomArray later.
      of: 'Method',
      name: 'methods'
    }
  ],

  methods: [ foam.boot.buildClass ]
});
