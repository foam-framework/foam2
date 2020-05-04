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
The client has three options for delegating:
1. If not mediator, proxy to the next 'server' determined by ClusterConfigSupport, delegate result.
2. If mediator, but not primary, proxy to next 'server', find result.
3. If primary mediator, then delegate to medusaAdapter, accept result.
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
      // TODO: clear on ClusterConfigDAO update.
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      javaFactory: `
      if ( getConfig().getIsPrimary() ) {
        getLogger().debug("dao", "MedusaAdapterDAO");
        return new MedusaAdapterDAO.Builder(getX())
          .setNSpec(getNSpec())
          .setDelegate(getDelegate())
          .build();
      }
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig serverConfig = support.getNextServerConfig(getX());
      getLogger().debug("dao", "ClientDAO");
      return support.getClientDAO(getX(), getServiceName(), getConfig(), serverConfig);
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
      name: 'init_',
      javaCode: `

      `
    },
    {
      name: 'put_',
      javaCode: `
      getLogger().debug("put", obj.getProperty("id"), "primary", getConfig().getIsPrimary(), getConfig().getType().getLabel());
      if ( getConfig().getIsPrimary() ) {
        return getDao().put_(x, obj);
      }
      FObject result = submit(x, DOP.PUT, obj);
      if ( getConfig().getType() == MedusaType.MEDIATOR ) {
        FObject found = getDelegate().find_(x, obj.getProperty("id"));
        if ( found == null ||
            ! found.equals(result) ) {
          getLogger().error("put", "corrupt", "found != result");
        }
        return result;
      }
      return getDelegate().put_(x, result);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      if ( getConfig().getIsPrimary() ) {
        return getDao().remove_(x, obj);
      }
      FObject result = submit(x, DOP.REMOVE, obj);
      if ( getConfig().getType() == MedusaType.MEDIATOR ) {
        return result;
      }
      return getDelegate().remove_(x, obj);
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

        // forward?
        if ( getConfig().getIsPrimary() ) {
          if ( DOP.PUT == cmd.getDop() ) {
            cmd.setData(put_(x, cmd.getData()));
          } else if ( DOP.REMOVE == cmd.getDop() ) {
            cmd.setData(remove_(x, cmd.getData()));
          } else {
            getLogger().warning("Unsupported operation", cmd.getDop().getLabel());
            throw new UnsupportedOperationException(cmd.getDop().getLabel());
          }
          return cmd;
        }

        cmd.addHop(x);
        ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
        ClusterConfig serverConfig = support.getNextServerConfig(getX());
        return support.getClientDAO(x, getServiceName(), getConfig(), serverConfig).cmd_(x, cmd);
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
      // REVIEW: set context to null after init so it's not marshalled across network. Periodically have contexts being marshalled
      ((ContextAware) obj).setX(null);
      ClusterCommand cmd = new ClusterCommand(x, getNSpec().getName(), dop, obj);
      cmd.setX(null);

      int retryDelay = 10;
      while ( true ) {
        try {
          DAO  dao = getDao();
          getLogger().debug("submit", "dao", dao.getClass().getSimpleName(), dop.getLabel(), obj.getProperty("id"), "request");
          FObject result = (FObject) getDao().cmd_(x, cmd);
          getLogger().debug("submit", "dao", dao.getClass().getSimpleName(), dop.getLabel(), obj.getProperty("id"), "response");
          return result;
        } catch ( Throwable t ) {
          getLogger().debug("submit", t.getMessage());

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
  ]
});
