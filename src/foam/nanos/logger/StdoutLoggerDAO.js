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
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected static ThreadLocal<foam.util.FastTimestamper> timestamper_ = new ThreadLocal<foam.util.FastTimestamper>() {
    @Override
    protected foam.util.FastTimestamper initialValue() {
      foam.util.FastTimestamper ft = new foam.util.FastTimestamper();
      return ft;
    }
  };
          `
        }));
      }
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
          System.err.println(timestamper_.get().createTimestamp(lm.getCreated().getTime())+","+lm.getThread()+","+lm.getSeverity()+","+lm.getMessage());
        }
      }
      return lm;
      `
    }
  ]
});
