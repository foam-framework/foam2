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
  package: 'foam.demos.olympics',
  name: 'PolymerController',
  extends: 'foam.demos.olympics.Controller',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'filterController',
      value: {
        class: 'foam.u2.search.FilterController',
        addingSpec: { class: 'foam.u2.Element', nodeName: 'paper-material' },
        filterAreaSpec: {
          class: 'foam.u2.Element',
          nodeName: 'paper-material'
        },
        textSearch: true,
        allowAddingFilters: false,
        tableView: { class: 'foam.u2.Scroller' },
        searchFields: [
          'color',
          'year',
          'city',
          'sport',
          'event',
          'country',
          'gender'
        ],
        buildFilter: function(args) {
          if ( args.view.cls_.getAxiomByName('label') ) {
            args.view.label = args.label || args.prop.label;
          }
          return this.E().addClass(this.myClass('filter-container'))
              .add(args.view);
        }
      }
    }
  ],

  methods: [
    function init() {
      // Load the Polymer overrides.
      this.__subContext__.register(foam.lookup('foam.u2.md.tag.PaperInput'),
          'foam.u2.tag.Input');
      this.__subContext__.register(
          foam.lookup('foam.u2.md.tag.PaperDropdown'),
          'foam.u2.tag.Select');
      this.__subContext__.register(foam.lookup('foam.u2.md.ActionView'),
          'foam.u2.ActionView');
      this.SUPER();
    }
  ]
});
