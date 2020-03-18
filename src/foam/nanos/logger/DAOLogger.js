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
    'foam.dao.DAO',
    'foam.dao.NullDAO',
    'foam.log.LogLevel'
  ],

  properties: [
    {
      name: 'delegate',
      class: 'foam.dao.DAOProperty',
      visibility: 'HIDDEN'
    },
    {
      name: 'logger',
      class: 'Object',
      javaFactory: `return new foam.nanos.logger.StdoutLogger();`,
      visibility: 'HIDDEN'
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
          type: 'foam.log.LogLevel'
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

      LogMessage lm = new LogMessage(getX());
      lm.setThread(Thread.currentThread().getName());
      lm.setSeverity(severity);
      lm.setMessage(message);

      getDelegate().put(lm);
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
      javaCode: 'submit(LogLevel.WARN, combine(args));'
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
