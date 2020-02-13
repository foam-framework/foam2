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
    },
    {
      name: 'multiline',
      class: 'Boolean',
      value: false
    },
    {
      name: 'outputter',
      class: 'Object',
      javaFactory: `
      foam.lib.json.Outputter out = new foam.lib.json.Outputter(getX());
      out.setOutputDefaultValues(true);
      out.setMultiLine(getMultiline());
      return out;
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      LogMessage lm = (LogMessage) getDelegate().put_(x, obj);
      if ( getEnabled() &&
           lm != null ) {
        System.out.println(lm.getCreated() + ","+lm.getThreadName()+","+lm.getSeverity()+","+lm.getMessage());
      } 
      return lm;
      `
    }
  ]
});
