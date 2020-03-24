/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter.advanced',
  name: 'CriteriaView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.filter.property.PropertyFilterView'
  ],

  css: `
    ^ {
      position: relative;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }

    ^ .foam-u2-filter-property-PropertyFilterView {
      flex: 1 1 250px;
    }
  `,

  properties: [
    {
      name: 'filterController',
      documentation: 'To be passed in from the AdvancedFilterView'
    },
    {
      class: 'Array',
      name: 'modelProps',
      documentation: 'Array of properties that this filter will filter on',
      factory: function() {
        var dao = this.filterController.dao;
        var of = dao && dao.of;

        if ( ! of ) return [];

        // Returns array of properties with searchView and not hidden
        return of.getAxiomsByClass(foam.core.Property)
          .filter((prop) => prop.searchView && ! prop.hidden)
          .map(foam.core.Property.NAME.f);
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .forEach(this.modelProps, function(property) {
          var axiom = self.filterController.dao.of.getAxiomByName(property);
          if ( axiom ) {
            this.start(self.PropertyFilterView, {
              searchView: axiom.searchView,
              property: axiom,
              dao$: self.filterController$.dot('dao')
            })
            .end();
          }
        })
    }
  ]

});
