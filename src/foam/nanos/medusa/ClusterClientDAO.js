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
    'foam.nanos.logger.PrefixLogger'
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
      value: 'cluster'
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
          getNSpec().getName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      return submit(x, DOP.PUT, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      return submit(x, DOP.REMOVE, obj);
      `
    },
    {
      documentation: `If a ClusterServer is looking for MDAO return self so this Client will proxy to the next Server.`,
      name: 'cmd_',
      javaCode: `
      if ( ClusterServerDAO.GET_CLIENT_CMD.equals(obj) ) {
        getLogger().debug("cmd", "GET_CLIENT_CMD");
        return this;
      }
      if ( obj instanceof ClusterCommand ) {
        ClusterCommand cmd = (ClusterCommand) obj;
        getLogger().debug("cmd", "ClusterCommand");

        cmd.addHop(x);
        return submit(x, DOP.CMD, cmd);
      }
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
      type: 'FObject',
      javaCode: `
       ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");

     // REVIEW: set context to null after init so it's not marshalled across network. Periodically have contexts being marshalled
      ((ContextAware) obj).setX(null);
      ClusterCommand cmd = null;
      if ( obj instanceof ClusterCommand ) {
        cmd = (ClusterCommand) obj;
      } else {
        cmd = new ClusterCommand(x, getNSpec().getName(), dop, obj);
      }
      cmd.setX(null);

      int retryDelay = 10;
      while ( true ) {
        try {
          ClusterConfig serverConfig = support.getNextServerConfig(getX());
          DAO dao = support.getClientDAO(getX(), getServiceName(), getConfig(), serverConfig);
          getLogger().debug("submit", "request", "dao", dao.getClass().getSimpleName(), dop.getLabel(), obj.getClass().getSimpleName(), obj.getProperty("id"));

          FObject data = null;
          Object result = null;
          if ( DOP.PUT == cmd.getDop() ) {
            result = dao.put_(x, cmd);
          } else if ( DOP.REMOVE == cmd.getDop() ) {
            result = dao.remove_(x, cmd);
          } else if ( DOP.CMD == cmd.getDop() ) {
            result = dao.cmd_(x, cmd);
            cmd = (ClusterCommand) dao.cmd_(x, cmd);
            data = cmd.getData();
          }
          if ( result != null ) {
            if ( result instanceof FObject ) {
              data = (FObject) result;
            } else if ( result instanceof ClusterCommand ) {
              data = ((ClusterCommand) result).getData();
            }
            getLogger().debug("submit", "response", "dao", dao.getClass().getSimpleName(), dop.getLabel(), data.getClass().getSimpleName(), data.getProperty("id"));
          } else {
            getLogger().debug("submit", "response", "dao", dao.getClass().getSimpleName(), dop.getLabel(), "null");

          }

          return data;
        } catch ( ClusterException e ) {
          getLogger().debug("submit", e.getMessage());
          throw e;
        } catch ( RuntimeException e ) {
          getLogger().debug("submit", e.getMessage());
          throw e;
        } catch ( Throwable t ) {
          getLogger().debug("submit", t.getMessage());
//          getLogger().debug("submit", t);

          if ( getMaxRetryAttempts() > -1 &&
               cmd.getRetry() >= getMaxRetryAttempts() ) {
            getLogger().debug("retryAttempt >= maxRetryAttempts", cmd.getRetry(), getMaxRetryAttempts());
            throw t;
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
            throw t;
          }
        }
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
