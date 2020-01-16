foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'InvoiceHistoryAuthorizer',
  implements: ['foam.nanos.auth.Authorizer'],

  documentation: `AuthorizableAuthorizer which checks if user has access to the invoice history record`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'net.nanopay.invoice.model.Invoice',
    'foam.dao.history.HistoryRecord',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.AuthorizationException',
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      javaCode: `
        User user = (User) x.get("user");
        if ( user == null ) {
          throw new foam.nanos.auth.AuthenticationException("User not found.");
        } else if ( ! "admin".equalsIgnoreCase(user.getGroup()) && ! "system".equalsIgnoreCase(user.getGroup())) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        DAO invoiceDAO = (DAO) x.get("invoiceDAO");
        User user = (User) x.get("user");

        ArraySink invoiceArraySink = (ArraySink) invoiceDAO.where(
          EQ(Invoice.ID, ((HistoryRecord) obj).getObjectId())
        ).select(new ArraySink());
        Invoice invoice = (Invoice) invoiceArraySink.getArray().get(0);
        if ( (invoice.getPayeeId() != user.getId()) && (invoice.getPayerId() != user.getId()) ){
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        User user = (User) x.get("user");
        if ( user == null ) {
          throw new foam.nanos.auth.AuthenticationException("User not found.");
        } else if ( ! "admin".equalsIgnoreCase(user.getGroup()) && ! "system".equalsIgnoreCase(user.getGroup())) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = (User) x.get("user");
        if ( user == null ) {
          throw new foam.nanos.auth.AuthenticationException("User not found.");
        } else if ( ! "admin".equalsIgnoreCase(user.getGroup()) && ! "system".equalsIgnoreCase(user.getGroup())) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'checkGlobalRead',
      javaCode: `
        String permission = "invoiceHistoryDAO.read.*";
        AuthService authService = (AuthService) x.get("auth");
        try {
          return authService.check(x, permission);
        } catch ( AuthorizationException e ) {
          return false;
        }
      `
    },
    {
      name: 'checkGlobalRemove',
      javaCode: `
        String permission = "invoiceHistoryDAO.read.*";
        AuthService authService = (AuthService) x.get("auth");
        try {
          return authService.check(x, permission);
        } catch ( AuthorizationException e ) {
          return false;
        }
      `
    }
  ],
});
