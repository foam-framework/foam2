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
    'foam.nanos.logger.LogLevel'
  ],

  properties: [
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      javaFactory: `
initializing.set(true);
String daoName = "logMessageDAO";
System.out.println("DAOLogger initializing "+daoName);
DAO dao = (DAO) getX().put("logger", new foam.nanos.logger.StdoutLogger()).get(daoName);
if ( dao == null ) {
  System.err.println("DAOLogger DAO not found: "+daoName);
  dao = new NullDAO();
}
initializing.set(false);
return dao;
`
    },
    {
      name: 'logger',
      class: 'Object',
      javaFactory: `return new foam.nanos.logger.StdoutLogger();`
    }
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
          `protected ThreadLocal<Boolean> initializing = new ThreadLocal<Boolean>() {
  @Override
  protected Boolean initialValue() {
    return false;
  }
};`
        }));
      }
    }
  ],

  methods: [
    {
      name: 'submit',
      type: 'Void',
      args: [
        {
          name: 'severity',
          type: 'foam.nanos.logger.LogLevel'
        },
        {
          name: 'message',
          type: 'String'
        }
      ],
      javaCode: `
if ( initializing.get() ) {
  System.out.println("DAOLogger initializing");
  return;
}
LogMessage lm = new LogMessage.Builder(getX()).setSeverity(severity).setMessage(message).build();
getDao().put_(getX().put("logger", (Logger) getLogger()), lm);
`
    },
    {
      name: 'log',
      type: 'Void',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: 'submit(LogLevel.INFO, combine(args));'
    },
    {
      name: 'info',
      type: 'Void',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: 'submit(LogLevel.INFO, combine(args));'
    },
    {
      name: 'warning',
      type: 'Void',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: 'submit(LogLevel.WARNING, combine(args));'
    },
    {
      name: 'error',
      type: 'Void',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: 'submit(LogLevel.ERROR, combine(args));'
    },
    {
      name: 'debug',
      type: 'Void',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: 'submit(LogLevel.DEBUG, combine(args));'
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: 'return this.getClass().getSimpleName();'
    }
  ]
});
