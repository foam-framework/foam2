/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogMessageDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Logger decorator which adds static properties to each log message`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.dao.NullDAO',
    'foam.log.LogLevel',
    'foam.mlang.predicate.*',
    'foam.mlang.Expr',
    'static foam.mlang.MLang.TRUE',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      name: 'hostname',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname", "localhost");'
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
      LogMessage lm = (LogMessage) obj;
      if ( foam.util.SafetyUtil.isEmpty(lm.getTimestamp()) ) {
        lm.setHostname(getHostname());
        lm.setTimestamp(((foam.util.SyncFastTimestamper)getTimestamper()).createTimestamp());
        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        lm.setCreatedBy(user.getId());
        User realUser = subject.getRealUser();
        lm.setCreatedByAgent(realUser.getId());
      }
      return getDelegate().put_(x, lm);
      `
    },
    {
      documentation: `On select calculate 'created' dates to support range filtering in table views.  Also, after going through the trouble, save the date.`,
      name: 'select_',
      javaCode: `
      Sink returnSink = sink;
      if ( returnSink == null ) {
        returnSink = new ArraySink();
      }
      Sink delegateSink = returnSink;
      if ( predicate != null ) {
        // Remove CREATED Expressions from MDAO predicate, apply as Sink Predicate
        predicate = predicate.partialEval();
        delegateSink = new foam.dao.PredicatedSink((Predicate) ((FObject)predicate).fclone(), returnSink);
        if ( predicate instanceof Nary ) {
          Predicate[] pa = ((Nary)predicate).getArgs();
          for ( int i = 0; i < pa.length; i++ ) {
            Predicate p = pa[i];
            if ( p instanceof Binary ) {
              Expr expr = ((Binary) p).getArg1();
              if ( expr instanceof PropertyInfo ) {
                PropertyInfo pInfo = (PropertyInfo) LogMessage.getOwnClassInfo().getAxiomByName(((PropertyInfo) expr).getName());
                if ( pInfo.getName().equals(LogMessage.CREATED.getName()) ) {
                  pa[i] = TRUE;
                }
              }
            }
          }
        }
        predicate = predicate.partialEval();
      }
      getDelegate().select_(x, new LogMessageCreatedSink(x, delegateSink, getDelegate()), skip, limit, order, predicate);
      return returnSink;
      `
    }
  ]
});
