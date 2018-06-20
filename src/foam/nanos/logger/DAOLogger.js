/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'DAOLogger',
  extends: 'foam.nanos.logger.AbstractLogger',

  documentation: `Logger which builds a modelled LogMessage from the free form Logger calls and puts it into the LogMessageDAO`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.NullDAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.LogLevel'
  ],

  properties: [
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      javaFactory: `
String daoName = "logMessageDAO";
DAO dao = (DAO) getX().get(daoName);
if ( dao == null ) {
  System.err.println("DAO not found: "+daoName);
  return new NullDAO();
}
return dao;
`
    }
 ],

  methods: [
    {
      name: 'submit',
      args: [
        {
          name: 'severity',
          javaType: 'foam.nanos.logger.LogLevel'
        },
        {
          name: 'message',
          javaType: 'String'
        }
      ],
      javaReturns: 'void',
      javaCode: `
X x = getX();
LogMessage lm = new LogMessage();
lm.setDate(sdf.get().format(System.currentTimeMillis()));
lm.setSeverity(severity);
User user = (User) x.get("user");
if ( user != null ) {
  lm.setUser(String.valueOf(user.getId()));
} else {
  lm.setUser("1");
}
lm.setMessage(message);
getDao().put(lm);
`
    },
    {
      name: 'log',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: 'submit(LogLevel.INFO, combine(args));'
    },
    {
      name: 'info',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: 'submit(LogLevel.INFO, combine(args));'
    },
    {
      name: 'warning',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: 'submit(LogLevel.WARNING, combine(args));'
    },
    {
      name: 'error',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: 'submit(LogLevel.ERROR, combine(args));'
    },
    {
      name: 'debug',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: 'submit(LogLevel.DEBUG, combine(args));'
    },
    {
      name: 'toString',
      javaReturns: 'String',
      javaCode: 'return this.getClass().getSimpleName();'
    }
  ]
});
