/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  A Faceted Axiom, when added to a Class, makes it implement
  the Facet-Manager Pattern, meaning that calls to create() can
  be intercepted and return a special Facet class depending on the
  value of the 'of' create argument.

  Ex.:
  foam.CLASS({
    name: 'View',
    axioms: [ foam.pattern.Faceted.create() ],
    properties: [ 'of' ],
    methods: [ function view() { return 'default' } ]
  });

  foam.CLASS({name: 'A'});
  foam.CLASS({name: 'B'});
  foam.CLASS({name: 'C'});
  foam.CLASS({name: 'BView', extends: 'View', methods: [function view() { return 'BView'; }]});
  foam.CLASS({name: 'CView', extends: 'View', methods: [function view() { return 'CView'; }]});

  console.log(View.create({of: A}));
  console.log(View.create({of: B}));
  console.log(View.create({of: C}));
*/
// FUTURE: add createOriginal() (or similar) method.
foam.CLASS({
  package: 'foam.pattern',
  name: 'Faceted',

  methods: [
    function installInClass(cls) {
      var oldCreate = cls.create;

      cls.getFacetOf = function(of, X) {
        if ( ! of ) return this;
        X = foam.core.FObject.isInstance(X) ? X.__context__ : foam.__context__;

        var name;
        var pkg;
        if ( foam.String.isInstance(of) ) {
          name = of.substring(of.lastIndexOf('.') + 1);
          pkg  = of.substring(0, of.lastIndexOf('.'))
        } else {
          name = of.name;
          pkg  = of.package;
        }

        var id = ( pkg ? pkg + '.' : '' ) + name + this.name;

        return X.lookup(id, true) || this;
      };

      // ignoreFacets is set to true when called to prevent a second-level
      // of facet checking
      cls.create = function(args, X, ignoreFacets) {
        if ( ! ignoreFacets ) {
          var of = args && ( args.of || ( args.data && args.data.of ) );
          var facetCls = this.getFacetOf(of, X);

          if ( facetCls !== this ) return facetCls.create(args, X, true);
        }

        return oldCreate.apply(this, arguments);
      }
    }
  ],

  properties: [
    ['name', 'foam.pattern.Faceted']
  ]
});
