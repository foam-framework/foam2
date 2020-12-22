/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter.advanced',
  name: 'CriteriaView',
  extends: 'foam.u2.View',

  documentation: `
    Criteria View obtains all the properties to be displayed from the Filter
    Controller and displays the appropriate Property Filter. Unless the property
    is hidden, the property filter will be shown. TODO: Show only permissioned
    properties.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.filter.property.PropertyFilterView',
    'foam.u2.search.TextSearchView'
  ],

  imports: [
    'filterController'
  ],

  css: `
    ^ {
      position: relative;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }

    ^general-field {
      margin: 0 8px;
      margin-top: 8px;
      flex: 1 1 100%;
    }

    ^general-field .foam-u2-tag-Input {
      width: 100%;
      height: 34px;
      border-radius: 5px;
      border: solid 1px #cbcfd4;
    }

    ^ .foam-u2-filter-property-PropertyFilterView {
      flex: 1 1 250px;
    }
  `,

  messages: [
    { name: 'LABEL_SEARCH',    message: 'Search' }
  ],

  properties: [
    {
      name: 'searchView',
      postSet: function(_, n) {
        // Restore if an existing one has been made
        var existingPredicate = this.filterController.getExistingPredicate(this.criteria, n.name);
        if ( existingPredicate && existingPredicate !== this.TRUE ) {
          // searchView's view may not have been instantiated by this point.
          // Sub to it to restore previous search
          n.view$.sub(() => {
            n.view.data = existingPredicate.args[1].arg1.value;
          });
        }
        // Add view to controller for tracking
        this.filterController.add(n, n.name, this.criteria);
      }
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
    },
    {
      name: 'criteria',
      documentation: 'Keeps track which criteria this Criteria View belongs to'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start(this.TextSearchView, {
          richSearch: true,
          of: this.filterController.dao.of.id,
          onKey: true,
          viewSpec: {
            class: 'foam.u2.tag.Input',
            placeholder: this.LABEL_SEARCH
          }
        }, this.searchView$).addClass(self.myClass('general-field'))
        .end()
        .forEach(this.modelProps, function(property) {
          var axiom = self.filterController.dao.of.getAxiomByName(property);
          if ( axiom ) {
            this.start(self.PropertyFilterView, {
              criteria: self.criteria,
              searchView: axiom.searchView,
              property: axiom,
              dao: self.filterController.dao
            })
            .end();
          }
        })
    }
  ]

});
