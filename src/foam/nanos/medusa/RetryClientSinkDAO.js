/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'RetryClientSinkDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: ['foam.dao.Sink'],

  documentation: 'Implements both Sink and DAO and performs Retry on Sink.put and DAO.put,remove,cmd.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'name',
      class: 'String',
      javaFactory: `
      if ( getDelegate() != null ) {
        return getDelegate().getOf().getId();
      }
      return this.getClass().getSimpleName();
      `
    },
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry.',
      value: 20
    },
    {
      class: 'Int',
      name: 'maxRetryDelay',
      value: 20000
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public RetryClientSinkDAO(X x, DAO delegate) {
    super(x, delegate);
  }
         `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      javaCode: `
      return (FObject) submit(x, obj, DOP.PUT);
      `
    },
    {
      name: 'cmd_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      javaCode: `
      return submit(x, obj, DOP.CMD);
      `
    },
    {
      name: 'submit',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        }
      ],
      javaType: 'Object',
      javaCode: `
      int retryAttempt = 0;
      int retryDelay = 10;

      getLogger().debug("submit", dop);

      while ( true ) {
        try {
          if ( DOP.PUT == dop ) {
            return getDelegate().put_(getX(), (FObject)obj);
          } else if ( DOP.CMD == dop ) {
            return getDelegate().cmd_(getX(), obj);
          } else {
            throw new UnsupportedOperationException("Unknown operation: "+dop);
          }
        } catch ( Throwable t ) {
          getLogger().error(t.getMessage(), t);

          if ( getMaxRetryAttempts() > -1 &&
               retryAttempt >= getMaxRetryAttempts() ) {
            getLogger().warning("retryAttempt >= maxRetryAttempts", retryAttempt, getMaxRetryAttempts());

            // TODO: Alarm
            //throw new RuntimeException("Rejected, retry limit reached.", t);
            break;
          }
          retryAttempt += 1;

          // delay
          try {
            retryDelay *= 2;
            if ( retryDelay > getMaxRetryDelay() ) {
              retryDelay = 10;
            }
            getLogger().debug("retry attempt", retryAttempt, "delay", retryDelay);
            Thread.sleep(retryDelay);
          } catch(InterruptedException e) {
            Thread.currentThread().interrupt();
            getLogger().debug("InterruptedException");
          }
        }
      }
      return obj;
      `
    },
    // Sink
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ],
      javaCode: `
      submit(getX(), obj, DOP.PUT);
      `
    },
    {
      // TODO:
      name: 'remove',
      javaCode: `//nop`
    },
    {
      name: 'eof',
      javaCode: `//nop`
    },
    {
      name: 'reset',
      javaCode: `//nop`
    }
  ]
});
