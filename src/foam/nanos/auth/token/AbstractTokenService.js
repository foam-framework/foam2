/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.token',
  name: 'AbstractTokenService',
  abstract: true,

  documentation: 'Abstract implementation of Token Service',

  implements: [
    'foam.nanos.auth.token.TokenService'
  ],

  javaImports: [
     'java.util.Calendar',
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
