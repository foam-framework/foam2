/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'FilterSearch',
  extends: 'foam.u2.View',

  documentation: `
    Filter search takes the properties defined in 'searchColumns' and creates
    a filter option which allows a user to filter the DAO by.
  `,

  requires: [
    'foam.core.SimpleSlot',
    'foam.u2.search.SearchManager',
    'foam.u2.filter.FilterViewController'
  ],

  imports: [
    'dao',
    'searchColumns'
  ],

  exports: [
    'as filterController',
    'as data',
    'searchManager'
  ],

  css: `
    ^container-filter {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
  `,

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'data'
    },
    {
      class: 'Array',
      name: 'filters',
      factory: null,
      expression: function(dao, searchColumns) {
        var of = dao && dao.of;

        if ( ! of ) return [];

        if ( searchColumns ) return searchColumns;

        if ( of.model_.searchColumns ) return of.model_.searchColumns;

        if ( of.model_.tableColumns ) {
          return of.model_.tableColumns.filter(function(c) {
            var axiom = of.getAxiomByName(c);
            return axiom && axiom.searchView;
          });
        }

        return of.getAxiomsByClass(foam.core.Property)
          .filter((prop) => prop.searchView && ! prop.hidden)
          .map(foam.core.Property.NAME.f);
      }
    },
    {
      name: 'searchManager',
      factory: function() {
        return this.SearchManager.create({
          dao$: this.dao$,
          predicate$: this.data$
        });
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(self.myClass())
        .add(this.slot(function(filters) {
          self.show(filters.length);

          var e = this.E().addClass(self.myClass('container-filter'));
          e.onDetach(this.searchManager);
          e.forEach(filters, function(f) {
            var axiom = self.dao.of.getAxiomByName(f);

            this.start(self.FilterViewController, {
              searchView: axiom.searchView,
              property: axiom,
              dao$: self.dao$
            })
            .end();
          });

          return e;
        }, this.filters$));
    },

    function addFilter(key) {
      this.filters = this.filters.concat(key);
    },

    function removeFilter(key) {
      this.filters = this.filters.filter(function(k) {
        return key !== k;
      });
    }
  ]
});
