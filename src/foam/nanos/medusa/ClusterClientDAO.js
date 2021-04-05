/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterClientDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Marshall put and remove operations to the ClusterServer.
`,

  implements: [
    'foam.nanos.boot.NSpecAware',
  ],

  javaImports: [
    'foam.core.ContextAware',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.dao.MDAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      of: 'foam.nanos.boot.NSpec'
    },
    {
      name: 'serviceName',
      class: 'String',
      javaFactory: `
      if ( getNSpec() != null ) {
        return getNSpec().getName();
      }
      return "na";
      `
    },
    {
      name: 'clusterServiceName',
      class: 'String',
      value: 'cluster'
    },
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry, 0 to not retry',
      value: 20
    },
    {
      class: 'Int',
      name: 'maxRetryDelay',
      value: 20000
    },
    {
      // TODO: clear on ClusterConfigDAO update.
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig',
      javaFactory: `
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      return support.getConfig(getX(), support.getConfigId());
      `
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          getServiceName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public ClusterClientDAO(foam.core.X x, String serviceName, ClusterConfig config) {
    setX(x);
    setServiceName(serviceName);
    setConfig(config);
    setMaxRetryAttempts(0);
  }
        `);
      }
    }
  ],
  methods: [
    {
      name: 'put_',
      javaCode: `
      return (FObject) submit(x, DOP.PUT, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      return (FObject) submit(x, DOP.REMOVE, obj);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ClusterCommand ) {
        getLogger().debug("cmd", "ClusterCommand");
        return submit(x, DOP.CMD, (FObject) obj);
      }
      getLogger().debug("cmd", "delegate", obj.getClass().getSimpleName(), obj.toString());
      return getDelegate().cmd_(x, obj);
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
          name: 'dop',
          type: 'DOP'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      type: 'Object',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      PM pm = PM.create(x, getClass().getSimpleName(), getServiceName(), dop);

      ClusterCommand cmd = null;
      if ( obj instanceof ClusterCommand ) {
        cmd = (ClusterCommand) obj;
      } else {
        // REVIEW: set context to null after init so it's not marshalled across network. Periodically have contexts being marshalled
        if ( obj instanceof ContextAware ) {
          ((ContextAware) obj).setX(null);
        }
        cmd = new ClusterCommand(x, getServiceName(), dop, obj);
      }
      cmd.addHop(x, dop, "send");
      cmd.setX(null);

      int retryDelay = 10;
      try {
        while ( true ) {
          try {
            ClusterConfig serverConfig = support.getNextServer();
            DAO dao = support.getClientDAO(x, getClusterServiceName(), getConfig(), serverConfig);
            getLogger().debug("submit", "request", "to", serverConfig.getId(), "dao", dao.getClass().getSimpleName(), dop.getLabel(), obj.getClass().getSimpleName());

            Object result = null;
            if ( DOP.PUT == dop ) {
              result = dao.put_(x, cmd);
            } else if ( DOP.REMOVE == dop ) {
              result = dao.remove_(x, cmd);
            } else if ( DOP.CMD == dop ) {
              result = dao.cmd_(x, cmd);
              if ( result != null ) {
                // getLogger().debug("submit", "response", "from", serverConfig.getId(), "dao", dao.getClass().getSimpleName(), dop.getLabel(), result.getClass().getSimpleName());
                return result;
              }
            }
            if ( obj instanceof ClusterCommand ) {
              // getLogger().debug("submit", "response", "from", serverConfig.getId(), "dao", dao.getClass().getSimpleName(), dop.getLabel(), (result != null ? result.getClass().getSimpleName() : "null"));
              cmd.setData((FObject) result);
              cmd.addHop(x, dop, "reply");
              return cmd;
            }
            return result;

          } catch ( ClusterException e ) {
            getLogger().debug("submit", e.getClass().getSimpleName(), e.getMessage());
            pm.error(x, e);
            throw e;
          } catch ( RuntimeException e ) {
            getLogger().debug("submit", e.getMessage());
            pm.error(x, e);
            throw e;
          } catch ( Throwable t ) {
            getLogger().debug("submit", t.getMessage());
            // getLogger().debug("submit", t);

            if ( getMaxRetryAttempts() > -1 &&
                 cmd.getRetry() >= getMaxRetryAttempts() ) {
              getLogger().debug("retryAttempt >= maxRetryAttempts", cmd.getRetry(), getMaxRetryAttempts());
              pm.error(x, "Retry limit reached.", t);
              throw new RuntimeException("Rejected, retry limit reached.", t);
            }
            cmd.setRetry(cmd.getRetry() + 1);

            // delay
            try {
              retryDelay *= 2;
              if ( retryDelay > getMaxRetryDelay() ) {
                retryDelay = 10;
              }
              getLogger().debug("retry attempt", cmd.getRetry(), "delay", retryDelay);
              Thread.sleep(retryDelay);
            } catch(InterruptedException e) {
              Thread.currentThread().interrupt();
              getLogger().debug("InterruptedException");
              pm.error(x, t);
              throw t;
            }
          }
        }
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'find_',
      javaCode: `
      throw new ClusterException("Unsupported operation: "+DOP.FIND.getLabel(), new UnsupportedOperationException(DOP.FIND.getLabel()));
      `
    },
    {
      name: 'select_',
      javaCode: `
      throw new ClusterException("Unsupported operation: "+DOP.SELECT.getLabel(), new UnsupportedOperationException(DOP.SELECT.getLabel()));
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
      throw new ClusterException("Unsupported operation: "+DOP.REMOVE_ALL.getLabel(), new UnsupportedOperationException(DOP.REMOVE_ALL.getLabel()));
      `
    },
  ]
});
