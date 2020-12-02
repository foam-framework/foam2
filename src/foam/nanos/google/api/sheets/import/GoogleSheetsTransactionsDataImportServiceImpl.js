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

        User payer = ((Subject) x.get("subject")).getUser();
        if ( payer == null )
          return false;
        
        t.setPayerId(payer.getId());

        String baseCurrency = ((Business)payer).getSuggestedUserTransactionInfo().getBaseCurrency();

        if ( t.getSourceCurrency() == null )
          t.setSourceCurrency(baseCurrency);

        BankAccount payerBankAccount = BankAccount.findDefault(x, payer, t.getSourceCurrency());
        if ( payerBankAccount == null )
          return false;
        t.setSourceAccount(payerBankAccount.getId());

        User payee = (User)userDAO.find(AND(INSTANCE_OF(Business.getOwnClassInfo()), EQ(Business.ID, t.getPayeeId())));
        if ( payee == null )
          return false;

        BankAccount payeeBankAccount = BankAccount.findDefault(x, payee, t.getSourceCurrency());
        t.setDestinationAccount(payeeBankAccount.getId());
        if ( payeeBankAccount == null )
          return false;

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