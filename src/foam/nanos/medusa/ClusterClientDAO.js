/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterClientDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Marshall put and remove operations to the ClusterServer.',

  javaImports: [
    'foam.core.ContextAware',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      documentation: `DAO nSpec service name which the remote must route.`,
      name: 'serviceName',
      class: 'String'
    },
    {
      documentation: `cluster nSpec service name at the remote node.`,
      name: 'clusterServiceName',
      class: 'String',
      value: 'cluster'
    },
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry.',
      value: -1
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
          getServiceName()
        }, (Logger) getX().get("logger"));
      `,
      transient: true
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Boolean clusterable = false;
      if ( obj instanceof Clusterable &&
           ! ((Clusterable) obj).getClusterable() ) {
        return getDelegate().put_(x, obj);
      } else {
        return submit(x, obj, DOP.PUT);
      }
      `
    },
    {
      name: 'remove_',
      javaCode: `
      Boolean clusterable = false;
      if ( obj instanceof Clusterable &&
           ! ((Clusterable) obj).getClusterable() ) {
        return getDelegate().remove_(x, obj);
      } else {
        return submit(x, obj, DOP.REMOVE);
      }
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
          type: 'foam.core.FObject'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        }
      ],
      javaType: 'foam.core.FObject',
      javaCode: `
      ElectoralService electoralService = (ElectoralService) x.get("electoralService");
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      getLogger().debug(dop.getLabel(), electoralService.getState().getLabel(), config.getName(), config.getIsPrimary(), config.getStatus().getLabel(), config.getId(), "primary", support.getPrimaryConfigId());

      foam.core.FObject old = null;
      if ( DOP.PUT == dop ) {
        old = getDelegate().find_(x, obj.getProperty("id"));
      }
      foam.lib.json.Outputter outputter = new foam.lib.json.Outputter(x).setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
      // Clear context so it's not marshalled across the network
      ((ContextAware) obj).setX(null);
      if ( obj instanceof foam.nanos.session.Session ) {
        ((foam.nanos.session.Session) obj).setContext(null);
      }

        String record = ( old != null ) ?
          outputter.stringifyDelta(old, obj) :
          outputter.stringify(obj);

        if ( foam.util.SafetyUtil.isEmpty(record) ||
            "{}".equals(record.trim()) ) {
          getLogger().debug("no changes", record);
          return obj;
        }

        int retryAttempt = 0;
        int retryDelay = 10;

        ClusterCommand cmd = new ClusterCommand(x, getServiceName(), dop, record);
        // NOTE: set context to null after init so it's not marshalled across network
        cmd.setX(null);

        while ( ! config.getIsPrimary() ) {
          try {
            if ( config.getStatus() != Status.ONLINE ) {
              throw new IllegalStateException("Cluster Client not ready.");
            }
            if ( electoralService.getState() != ElectoralServiceState.IN_SESSION ) {
              throw new IllegalStateException("Election in progress.");
            }
            ClusterConfig primary = support.getPrimary(x);
            getLogger().debug("to primary", primary.getId(), primary.getName(), "attempt", retryAttempt, cmd);
            PM pm = new PM(ClusterClientDAO.getOwnClassInfo(), getServiceName());
            FObject result = (FObject) support.getPrimaryDAO(x, getClusterServiceName()).cmd_(x, cmd);
            pm.log(x);
            getLogger().debug("from primary", primary.getId(), primary.getName(), "attempt", retryAttempt, result);
            return result;
          } catch ( Throwable t ) {
            if ( t instanceof UnsupportedOperationException ) {
              // primary has changed
              getLogger().debug(t.getMessage());
            } else if ( t instanceof IllegalStateException ) {
              // election in progress
              getLogger().debug(t.getMessage());
            } else {
              getLogger().error(t.getMessage(), t);
              throw t;
            }
            if ( getMaxRetryAttempts() > -1 &&
                 retryAttempt == getMaxRetryAttempts() ) {
              getLogger().debug("retryAttempt >= maxRetryAttempts", retryAttempt, getMaxRetryAttempts());

              if ( electoralService.getState() == ElectoralServiceState.IN_SESSION /*||
                  electoralService.getState() == ElectoralServiceState.ADJOURNED*/ ) {
                electoralService.dissolve(x);
              }
              throw t;
            }
            retryAttempt += 1;

            // delay
            try {
              if ( electoralService.getState() == ElectoralServiceState.IN_SESSION /*||
                  electoralService.getState() == ElectoralServiceState.ADJOURNED*/ ) {
                retryDelay *= 2;
              } else {
                retryDelay = 1000;
              }
              if ( retryDelay > getMaxRetryDelay() ) {
                retryDelay = 10;
                if ( t instanceof UnsupportedOperationException ) {
                  electoralService.dissolve(x);
                }
              }
              getLogger().debug("retry attempt", retryAttempt, "delay", retryDelay);
              Thread.sleep(retryDelay);
           } catch(InterruptedException e) {
              Thread.currentThread().interrupt();
              getLogger().debug("InterruptedException");
              throw t;
            }
          }
          // refresh
          config = support.getConfig(x, support.getConfigId());
        }

        getLogger().debug("primary delegating");
        if ( DOP.PUT == dop ) {
          return getDelegate().put_(x, obj);
        }
        if ( DOP.REMOVE == dop ) {
          return getDelegate().remove_(x, obj);
        }
        getLogger().error("Unsupported operation", dop.getLabel());
        throw new UnsupportedOperationException(dop.getLabel());
      `
    },
  ]
});
