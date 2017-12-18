foam.CLASS({
  package: 'foam.nanos.auth.token',
  name: 'AbstractTokenService',
  abstract: true,

  documentation: 'Abstract implementation of Token Service',

  implements: [
    'foam.nanos.auth.token.TokenService'
  ],

  javaImports: [
     'foam.dao.DAO',
     'foam.dao.ListSink',
     'foam.dao.Sink',
     'foam.mlang.MLang',
     'java.util.Calendar',
     'java.util.List',
     'java.util.UUID'
  ],

  methods: [
    {
      name: 'generateExpiryDate',
      javaReturns: 'java.util.Date',
      javaCode:
`Calendar calendar = Calendar.getInstance();
calendar.add(java.util.Calendar.DAY_OF_MONTH, 1);
return calendar.getTime();`
    }
  ]
});
