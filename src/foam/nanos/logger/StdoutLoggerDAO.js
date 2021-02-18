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
      name: 'mode',
      class: 'Enum',
      of: 'foam.nanos.app.Mode',
      value: 'DEVELOPMENT'
    },
    {
      name: 'timestamper',
      class: 'Object',
      of: 'foam.util.SyncFastTimestamper',
      visibility: 'HIDDEN',
      javaFactory: `return new foam.util.SyncFastTimestamper();`
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      LogMessage lm = (LogMessage) getDelegate().put_(x, obj);
      if ( getEnabled() &&
           lm != null ) {
        // Only write INFO, WARN, ERROR to SYSLOG in production to reduce
        // burden on syslogd, journald. With our own journal logs we are
        // effectively writing out logs twice. 
        if ( getMode() != Mode.PRODUCTION ||
             lm.getSeverity().getOrdinal() >= LogLevel.INFO.getOrdinal() ) {
          System.err.println(((foam.util.SyncFastTimestamper)getTimestamper()).createTimestamp(lm.getCreated().getTime())+","+lm.getThread()+","+lm.getSeverity()+","+lm.getMessage());
        }
      }
      return lm;
      `
    }
  ]
});
