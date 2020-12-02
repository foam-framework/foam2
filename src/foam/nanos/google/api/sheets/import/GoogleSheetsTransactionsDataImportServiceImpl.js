/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'GoogleSheetsTransactionsDataImportServiceImpl',
  extends: 'foam.nanos.google.api.sheets.GoogleSheetsDataImportServiceImpl',
  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.core.PropertyInfo',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Business',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF'
  ],
  methods: [
    {
      name: 'postSetValues',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'obj',
          type: 'Object'
        },
      ],
      javaCode: `
        DAO userDAO = (DAO)x.get("localUserDAO");

        Transaction t = (Transaction)obj;

        DAO businessDAO    = ((DAO) x.get("localBusinessDAO")).inX(x);

        BankAccount payerBankAccount;
        Business payer = (Business)businessDAO.find(t.getPayerId());
        if ( payer == null ) {
          User payerUser = (User) userDAO.find(t.getPayeeId());
          if ( payerUser == null )
            return false;
          payerBankAccount = BankAccount.findDefault(x, payerUser, t.getSourceCurrency());
        } else {
          payerBankAccount = BankAccount.findDefault(x, payer, t.getSourceCurrency());
        }
        
        if ( t.getSourceCurrency() == null )
          return false;
        if ( payerBankAccount == null )
          return false;
        t.setSourceAccount(payerBankAccount.getId());

        Business payee = (Business)businessDAO.find(t.getPayeeId());
        BankAccount payeeBankAccount;

        if ( t.getDestinationCurrency() == null ) {
          t.setDestinationCurrency(t.getSourceCurrency());
        }

        if ( payee == null ) {
          User payeeUser = (User) userDAO.find(t.getPayeeId());
          if ( payeeUser == null )
            return false;
          payeeBankAccount = BankAccount.findDefault(x, payeeUser, t.getDestinationCurrency());
        } else {
          payeeBankAccount = BankAccount.findDefault(x, payee, t.getDestinationCurrency());
        }

        if ( payeeBankAccount == null )
          return false;
         
        t.setDestinationAccount(payeeBankAccount.getId());

        return true;
      `
    },
    {
      name: 'getStringValueForProperty',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'prop',
          javaType: 'PropertyInfo'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      javaCode: `
        if ( prop.getName().equals("Status") )
          return ((Transaction)obj).getState(x).toString();
        return super.getStringValueForProperty(x, prop, obj);
      `
    }
  ]
});