/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'AbstractTOTPAuthService',
  extends: 'foam.nanos.auth.twofactor.AbstractOTPAuthService',
  abstract: true,

  documentation: 'Abstract time-based one-time password auth service',

  javaImports: [
    'java.util.Date'
  ],

  methods: [
    {
      name: 'checkCode',
      type: 'Boolean',
      args: [
        {
          name: 'key',
          type: 'Byte[]'
        },
        {
          name: 'code',
          type: 'Long'
        },
        {
          name: 'stepsize',
          type: 'Long'
        },
        {
          name: 'window',
          type: 'Integer'
        }
      ],
      javaCode:
`try {
  long t = new Date().getTime() / stepsize;

  for (int i = -window; i <= window; ++i) {
    long hash = calculateCode(key, t + i);
    if (hash == code) {
      return true;
    }
  }

  return false;
} catch (Throwable t) {
  return false;
}`
    }
  ]
});
