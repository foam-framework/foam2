foam.CLASS({
  package: 'foam.demos.flow2',
  name: 'User',
  requires: [
    'foam.demos.flow2.Transaction'
  ],
  imports: [
    'transactionDAO'
  ],
  properties: [
    {
      class: 'Int',
      name: 'id'
    },
    {
      class: 'Currency',
      name: 'balance'
    },
    {
      class: 'String',
      name: 'denomination'
    },
    {
      class: 'Date',
      name: 'createdOn'
    },
    {
      class: 'String',
      name: 'createdBy'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'transactions',
      expression: function(id, transactionDAO) {
        var E = foam.mlang.ExpressionsSingleton.create();
        return transactionDAO.where(
          E.OR(
            E.EQ(this.Transaction.PAYEE, id),
            E.EQ(this.Transaction.PAYER, id)
          )
        );
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.demos.flow2',
  name: 'Transaction',
  properties: [
    {
      class: 'Int',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.demos.flow2.User',
      name: 'payer'
    },
    {
      class: 'Reference',
      of: 'foam.demos.flow2.User',
      name: 'payee'
    },
    {
      class: 'Currency',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'denomination'
    },
    {
      class: 'Date',
      name: 'createdOn'
    }
  ]
});