/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter.advanced',
  name: 'AdvancedFilterView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.ModalHeader',
    'foam.u2.filter.advanced.CriteriaView'
  ],

  imports: [
    'closeDialog'
  ],

  css: `
    ^ {
      min-width: 480px;
      corner-radius: 5px;
    }

    ^container-advanced {
      max-width: 75%;
      max-height: 75%;
      overflow-y: scroll;
    }

    ^header-criteria {
      margin: 16px;
      margin-bottom: 0;
      height: 40px;

      border: 5px;
    }

    ^container-footer {

    }
  `,

  messages: [
    { name: 'TITLE_HEADER', message: 'Advanced Filters' }
  ],

  properties: [
    {
      name: 'filterController',
      documentation: 'To be passed in from the FilterView'
    },
    {
      name: 'criterias',
      documentation: 'Each criteria to be treated with an OR',
      factory: function() {
        return [{}];
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      documentation: 'DAO this filter is filtering on, passed by FilterView'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start(this.ModalHeader.create({
          title: this.TITLE_HEADER
        })).end()
        .add(this.slot(function(criterias) {
          return this.E().addClass(self.myClass('container-advanced'))
            .forEach(criterias, function(criteria) {
              // TODO: Draw each criteria as a box of property filters
              this.start().addClass(self.myClass('header-criteria'))

              .end()
              .start(self.CriteriaView.create({
                filterController$: self.filterController$
              })).end();
            })
            // TODO: Style button
            .startContext({data: self})
              .start(self.ADD_CRITERIA).end()
            .endContext();
        }))
        .start().addClass(this.myClass('container-footer'))

        .end();

    }
  ],

  actions: [
    {
      name: 'addCriteria',
      label: '+',
      code: function(X) {
        console.log('TODO: Add {} to criterias, collapse other criterias');
        this.criterias = this.criterias.concat([{}]);
        debugger;
      }
    },
    {
      name: 'closeModal',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'clearAll',
      label: 'Clear All',
      code: function(X) {
        console.log('TODO: Remove all local predicate changes')
      }
    },
    {
      name: 'filter',
      label: 'Filter',
      isEnabled: function(criterias) {
        return criterias && criterias.length > 0;
      },
      code: function(X) {
        console.log('TODO: Apply advanced mode and create predicates');
        this.filterController.isAdvanced = true;
        X.closeDialog();
      }
    }
  ],

  listeners: [

  ]
});
