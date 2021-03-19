/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'StdoutLoggerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Logger decorator which writes log message to System.out`,

  javaImports: [
    'foam.log.LogLevel'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      LogMessage lm = (LogMessage) getDelegate().put_(x, obj);
      if ( lm != null ) {
        if ( lm.getSeverity().getOrdinal() <= LogLevel.INFO.getOrdinal() ) {
          System.out.println(lm.toString());
        } else if ( lm.getSeverity().getOrdinal() > LogLevel.INFO.getOrdinal() ) {
          System.err.println(lm.toString());
        }
      }
      return lm;
      `
    }
  ]
});
