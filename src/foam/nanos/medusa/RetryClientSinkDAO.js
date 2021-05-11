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
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      name: 'name',
      class: 'String',
      javaFactory: `
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
          this.getClass().getSimpleName(),
          this.getName()
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
      documentation: 'Implement nop find to support this DAO being used from HashingJournal by ReplayDAO.',
      name: 'find_',
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
      return null;
      `
    },
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

      PM pm = PM.create(x, getClass().getSimpleName(), getName(), dop);
      Alarm alarm = null;
      try {
        while ( true ) {
          try {
            if ( DOP.PUT == dop ) {
              return getDelegate().put_(x, (FObject)obj);
            } else if ( DOP.REMOVE == dop ) {
              return getDelegate().remove_(x, (FObject)obj);
            } else if ( DOP.CMD == dop ) {
              return getDelegate().cmd_(x, obj);
            } else {
              throw new UnsupportedOperationException("Unknown operation: "+dop);
            }
          } catch ( ClusterException | MedusaException e ) {
            getLogger().debug("submit", e.getMessage());
            pm.error(x, e);
            throw e;
          } catch ( Throwable t ) {
            getLogger().warning(t.getMessage());

            if ( getMaxRetryAttempts() > -1 &&
                 retryAttempt >= getMaxRetryAttempts() ) {
              getLogger().warning("retryAttempt >= maxRetryAttempts", retryAttempt, getMaxRetryAttempts());
              if ( alarm == null ) {
                alarm = new Alarm(this.getClass().getSimpleName()+"."+getName(), AlarmReason.TIMEOUT);
               ((DAO) x.get("alarmDAO")).put_(x, alarm);
              }
              pm.error(x, "Retry limit reached.", t);
              throw new RuntimeException("Rejected, retry limit reached.", t);
            }
            retryAttempt += 1;

            // delay
            try {
              retryDelay *= 2;
              if ( retryDelay > getMaxRetryDelay() ) {
                retryDelay = 10;
              }
              getLogger().info("retry attempt", retryAttempt, "delay", retryDelay);
              Thread.sleep(retryDelay);
            } catch(InterruptedException e) {
              Thread.currentThread().interrupt();
              pm.error(x, t);
              throw t;
            }
          }
          if ( alarm != null ) {
            alarm.setIsActive(false);
            ((DAO) x.get("alarmDAO")).put_(x, alarm);
          }
        }
      } finally {
        pm.log(x);
      }
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
      javaCode: `
      getLogger().debug("eof");
      `
    },
    {
      name: 'reset',
      javaCode: `//nop`
    }
  ]
});
