foam.CLASS({
  package: 'foam.u2.view',
  name: 'FilteredReferenceView',
  extends: 'foam.u2.View',

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
      documentation: 'The key of the DAO that the user makes the second selection from. This DAO will be filtered based on the first selection.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'firstDAO',
      expression: function(firstDAOKey) {
        return this.__subContext__[firstDAOKey];
      }
    },
    {
      class: 'String',
      name: 'secondDAOKey',
      documentation: 'The key of the DAO that the user makes the first selection from.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'secondDAO',
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
      documentation: 'This is the filtered choice.'
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
