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
    'foam.dao.DAO',
    'foam.dao.NullDAO',
    'foam.log.LogLevel',
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
      lm.setHostname(getHostname());
      lm.setCreated(((foam.util.SyncFastTimestamper)getTimestamper()).createTimestamp());
      Subject subject = (Subject) x.get("subject");
      User user = subject.getUser();
      lm.setCreatedBy(user.getId());
      User realUser = subject.getRealUser();
      lm.setCreatedByAgent(realUser.getId());

      return getDelegate().put_(x, lm);
      `
    }
  ]
});
