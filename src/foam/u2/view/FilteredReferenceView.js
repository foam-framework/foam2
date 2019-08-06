foam.CLASS({
  package: 'foam.u2.view',
  name: 'FilteredReferenceView',
  extends: 'foam.u2.View',
  documentation: `
    FilteredReferenceView is basically two reference views, 
    the content of the second one is filtered by the choice of
    the first reference view. 
  `,

  requires: [
    'foam.u2.ReferenceView',
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'String',
      name: 'filteringDAOKey',
      documentation: 'The key of the DAO that the user makes the first selection from.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteringDAO',
      documentation: 'The DAO that the user makes the first selection from.',
      expression: function(filteringDAOKey) {
        return this.__subContext__[filteringDAOKey];
      }
    },
    {
      class: 'String',
      name: 'daoKey',
      documentation: 'The key of the DAO that the user makes the second selection from. This DAO will be filtered based on the first selection.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      documentation: 'The DAO that the user makes the second selection from. This DAO will be filtered based on the first selection.',
      expression: function(daoKey) {
        return this.__subContext__[daoKey];
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Property',
      name: 'filteredProperty',
      documentation: 'The property used to filter the second DAO.'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'filteringView',
      factory: function() {
        return {
          class: 'foam.u2.view.ReferenceView',
          dao: this.filteringDAO
        }
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'filteredView',
      factory: function() {
        return {
          class: 'foam.u2.view.ReferenceView'
        }
      }
    },
    {
      name: 'selection_',
      documentation: 'This is the choice from the first view.'
    },
    {
      name: 'filteredDAO',
      documentation: 'Filtered version of dao',
      expression: function(selection_, dao, filteredProperty) {
        return dao.where(selection_ ?
          this.EQ(filteredProperty, selection_) :
          this.FALSE);
      }
    },
  ],

  methods: [
    function initE() {
      this
        .tag(this.filteringView, {
          data$: this.selection_$,
        })
        .tag(this.filteredView, {
          data$: this.data$,
          dao$: this.filteredDAO$
        });
    }
  ]
});
