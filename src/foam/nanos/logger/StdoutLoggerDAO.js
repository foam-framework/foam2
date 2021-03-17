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

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],
  
  javaImports: [
    'foam.log.LogLevel',
    'foam.nanos.app.Mode'
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'appConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.app.AppConfig'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      LogMessage lm = (LogMessage) obj;
      if ( getEnabled() &&
           lm != null ) {
        if ( ( getAppConfig().getMode() != Mode.PRODUCTION &&
               lm.getSeverity().getOrdinal() == LogLevel.DEBUG.getOrdinal() ) ||
             lm.getSeverity().getOrdinal() == LogLevel.INFO.getOrdinal() ) {
          System.out.println(lm.toString());
        } else if ( lm.getSeverity().getOrdinal() > LogLevel.INFO.getOrdinal() ) {
          System.err.println(lm.toString());
        }
        // In PRODUCTION only write to syslogd for performance, no filesystem log
        if ( getAppConfig().getMode() != Mode.PRODUCTION ) {
          return getDelegate().put_(x, lm);
        }
        return lm;
      }
      return getDelegate().put_(x, obj);
      `
    }
  ]
});
