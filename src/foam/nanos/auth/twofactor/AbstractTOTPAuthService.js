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
    'java.util.Date',

    // todo: remove after fixing NP-1278
    'foam.nanos.logger.Logger',
    'java.util.Arrays'

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
      
`
// todo: remove all the loggers after fixing NP-1278
Logger logger = (Logger) getX().get("logger");

try {

  Date date = new Date();
  long t = date.getTime() / stepsize;

  StringBuilder sb = new StringBuilder();
  sb.append(String.format("---[NP-1278]---%n"));
  sb.append(String.format("---in checkCode, AbstractTOTPAuthService---%n"));
  sb.append(String.format("key = %s%n", Arrays.toString(key)));
  sb.append(String.format("token = %d%n", code));
  sb.append(String.format("stepsize = %d%n", stepsize));
  sb.append(String.format("window = %d%n", window));
  sb.append(String.format("date = %s%n", date.toString()));
  sb.append(String.format("time = %d%n", date.getTime()));
  sb.append(String.format("t = %d%n", t));

  for (int i = -window; i <= window; ++i) {
    long hash = calculateCode(key, t + i);
    sb.append(String.format("i = %d, hash = %d%n", i, hash));
    if (hash == code) {
      logger.debug(sb.toString());
      return true;
    }
  }
  logger.debug(sb.toString());
  return false;
} catch (Throwable t) {
  logger.error("[NP-1278] exception caught in checkCode: ", t);
  return false;
}`
    }
  ]
});
