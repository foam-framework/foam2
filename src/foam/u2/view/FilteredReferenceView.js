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

  exports: [
    'filteredDAO'
  ],

  properties: [
    {
      class: 'String',
      name: 'firstDAOKey',
      documentation: 'The key of the DAO that the user makes the first selection from.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'firstDAO',
      documentation: 'The DAO that the user makes the first selection from.',
      expression: function(firstDAOKey) {
        return this.__subContext__[firstDAOKey];
      }
    },
    {
      class: 'String',
      name: 'secondDAOKey',
      documentation: 'The key of the DAO that the user makes the second selection from. This DAO will be filtered based on the first selection.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'secondDAO',
      documentation: 'The DAO that the user makes the second selection from. This DAO will be filtered based on the first selection.',
      expression: function(secondDAOKey) {
        return this.__subContext__[secondDAOKey];
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Property',
      name: 'filteredProperty',
      documentation: 'The property used to filter the second DAO.'
    },
    {
      name: 'firstView',
      expression: function(firstDAO) {
        return {
          class: 'foam.u2.view.ReferenceView',
          dao: firstDAO
        }
      }
    },
    {
      name: 'secondView',
      expression: function() {
        return {
          class: 'foam.u2.view.ReferenceView',
          dao$: this.filteredDAO$
        }
      }
    },
    {
      name: 'selection_',
      documentation: 'This is the choice from the first view.'
    },
    {
      name: 'filteredDAO',
      documentation: 'Filtered version of secondDAO',
      expression: function(selection_, secondDAO, filteredProperty) {
        return secondDAO.where(selection_ ?
          this.EQ(filteredProperty, selection_) :
          this.FALSE);
      }
    },
  ],

  methods: [
    function initE() {
      this
        .tag(this.firstView, {
          data$: this.selection_$,
        })
        .tag(this.secondView, {
          data$: this.data$,
        });
    }
  ]
});
