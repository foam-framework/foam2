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

  documentation: 'Class/Prototype description.',

  properties: [
    {
      name: 'id',
      hidden: true,
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
    'documentation',
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
      postSet: function(_, a) { this.axioms_.push.apply(this.axioms_, a); }
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
