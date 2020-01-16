/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'invoiceHistoryAuthorizerTest',
  extends: 'foam.nanos.test.Test',
  flags: ['java'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.SequenceNumberDAO',
    'foam.nanos.auth.User',
    'foam.nanos.test.Test',
    'foam.test.TestUtils',
    'static foam.mlang.MLang.*',
    'net.nanopay.invoice.model.Invoice',
    'foam.dao.history.HistoryRecord',
    'foam.dao.ArraySink',
    'net.nanopay.contacts.Contact',
    'net.nanopay.auth.PublicUserInfo',
    'foam.nanos.auth.AuthorizationException',
    'java.util.Date'
  ],

  documentation: 'Class to test invoiceHistoryDAO security',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        x = x.put("user", null)
             .put("group", null)
             .put("twoFactorSuccess", false);
        User payerUser = new User();
        User payeeUser = new User();
        User unrelatedUser = new User();
        User adminUser = new User();
        DAO invoiceHistoryDAO = ((DAO) x.get("invoiceHistoryDAO")).inX(x);
        DAO invoiceDAO = (DAO) x.get("invoiceDAO");
        DAO bareUserDAO = (DAO) x.get("bareUserDAO");
        Invoice invoice = new Invoice();
        HistoryRecord historyRecord = new HistoryRecord();
        boolean threw;

        payerUser.setId(1);
        payeeUser.setId(2);
        unrelatedUser.setId(3);
        adminUser.setGroup("admin");

        x = x.put("user", adminUser);

        payeeUser = (User) bareUserDAO.put(payeeUser);

        invoice.setPayeeId(payeeUser.getId());
        invoice.setPayerId(payerUser.getId());
        invoice = (Invoice) invoiceDAO.put(invoice);

        historyRecord.setObjectId(invoice.getId());
        historyRecord = (HistoryRecord) invoiceHistoryDAO.inX(x).put(historyRecord);

        x = x.put("user", payerUser);

        ArraySink invoiceHistoryTestSinc = (ArraySink) invoiceHistoryDAO.inX(x).where(
          EQ(HistoryRecord.OBJECT_ID, historyRecord.getObjectId())
        ).select(new ArraySink());

        test( ! (invoiceHistoryTestSinc.getArray().size() == 0) , "User (Payer) from the same buisness can view invoice");

        x = x.put("user", payeeUser);
        invoiceHistoryTestSinc = (ArraySink) invoiceHistoryDAO.inX(x).where(
          EQ(HistoryRecord.OBJECT_ID, historyRecord.getObjectId())
        ).select(new ArraySink());

        test( ! (invoiceHistoryTestSinc.getArray().size() == 0) , "User (Payee) from the same buisness can view invoice");

        x = x.put("user", unrelatedUser);
        invoiceHistoryTestSinc = (ArraySink) invoiceHistoryDAO.inX(x).where(
          EQ(HistoryRecord.OBJECT_ID, historyRecord.getObjectId())
        ).select(new ArraySink());

        test( invoiceHistoryTestSinc.getArray().size() == 0 , "User from different buisness can not view invoice");

        threw = true;
        try {
          historyRecord = (HistoryRecord) invoiceHistoryDAO.inX(x).put(historyRecord);
        } catch ( AuthorizationException e ){
          threw = false;
        }

        test( ! threw , "Non Admin/System group user can't update HistoryRecord in invoiceHistroyDAO");

        threw = true;
        try {
          invoiceHistoryDAO.inX(x).remove(historyRecord);
        } catch ( AuthorizationException e ) {
          threw = false;
        }

        test( ! threw, "Non Admin/System group user can't delete HistoryRecord from invoiceHistroyDAO");

        threw = true;
        HistoryRecord historyRecord1 = new HistoryRecord();
        try {
          invoiceHistoryDAO.inX(x).put(historyRecord1);
        } catch ( AuthorizationException e ) {
          threw = false;
        }

        test( ! threw, "Non Admin/System group user can't add HistoryRecord to invoiceHistroyDAO");

        x = x.put("user", adminUser);
        threw = false;
        try {
          invoiceHistoryDAO.inX(x).remove(historyRecord1);
        } catch ( AuthorizationException e) {
          threw = true;
        }

        test( ! threw, "Admin user can delete historyRecord");

        threw = false;
        try {
          invoiceHistoryDAO.inX(x).put(historyRecord1);
        } catch ( AuthorizationException e){
          threw =true;
        }
        test( ! threw, "Admin user can add history record to invoiceHistoryDAO");

        threw = false;
        try {
          invoiceHistoryDAO.inX(x).inX(x).put(historyRecord1);
        } catch ( AuthorizationException e ){
          threw = true;
        }

        test(! threw, "Admin user can update invoiceHistoryDAO");
      `
    },
  ]
});
