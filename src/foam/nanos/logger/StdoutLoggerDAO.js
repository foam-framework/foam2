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

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      LogMessage lm = (LogMessage) getDelegate().put_(x, obj);
      if ( getEnabled() &&
           lm != null ) {
        System.out.println(lm.getCreated() + ","+lm.getThread()+","+lm.getSeverity()+","+lm.getMessage());
      } 
      return lm;
      `
    }
  ]
});
