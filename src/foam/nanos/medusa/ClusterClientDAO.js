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
        return submit(x, obj, ClusterCommand.PUT);
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
        return submit(x, obj, ClusterCommand.REMOVE);
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
          name: 'op',
          type: 'String'
        }
      ],
      javaType: 'foam.core.FObject',
      javaCode: `
      ElectoralService electoralService = (ElectoralService) x.get("electoralService");
      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      getLogger().debug(op, "electoral", electoralService.getState().getLabel(), "online", service.getOnline(x));
      foam.core.FObject old = null;
      if ( ClusterCommand.PUT == op ) {
        old = getDelegate().find_(x, obj.getProperty("id"));
      }
      foam.lib.json.Outputter outputter = new foam.lib.json.Outputter(x).setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
      // Clear context so it's not marshalled across the network
      ((ContextAware) obj).setX(null);
      if ( obj instanceof foam.nanos.session.Session ) {
        ((foam.nanos.session.Session) obj).setContext(null);
      }
        //TODO: outputDelta has problem when output array. Fix bugs then use output delta.
        // String record = ( old != null ) ?
        //   outputter.stringifyDelta(old, obj) :
        //   outputter.stringify(obj);
        String record = outputter.stringify(obj);
        if ( foam.util.SafetyUtil.isEmpty(record) ||
            "{}".equals(record.trim()) ) {
          getLogger().debug("no changes", record);
          return obj;
        }

        int retryAttempt = 0;
        int retryDelay = 10;

        ClusterCommand cmd = new ClusterCommand(x, getServiceName(), op, record);
        // NOTE: set context to null after init so it's not marshalled across network
        cmd.setX(null);

        while ( service != null &&
                ! service.getIsPrimary() ) {
        try {
          if ( electoralService.getState() == ElectoralServiceState.IN_SESSION ) {
              getLogger().debug("to primary", service.getPrimaryConfigId(), "attempt", retryAttempt, cmd);
              PM pm = new PM(ClusterClientDAO.getOwnClassInfo(), getServiceName());
              FObject result = (FObject) service.getPrimaryDAO(x, getClusterServiceName()).cmd_(x, cmd);
              pm.log(x);
              getLogger().debug("from primary", service.getPrimaryConfigId(), "attempt", retryAttempt, result);
              return result;
          } else {
              // getLogger().debug("Election in progress.", electoralService.getState().getLabel());
              throw new RuntimeException("Election in progress.");
          }
        } catch ( Throwable t ) {
            getLogger().debug(t.getMessage());

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
              }
              getLogger().debug("retry attempt", retryAttempt, "delay", retryDelay);
              Thread.sleep(retryDelay);
           } catch(InterruptedException e) {
              Thread.currentThread().interrupt();
              getLogger().debug("InterruptedException");
              throw t;
            }
          }
        }
        if ( service != null ) {
          getLogger().debug("primary delegating");
          if ( ClusterCommand.PUT == op ) {
            return getDelegate().put_(x, obj);
          }
          if ( ClusterCommand.REMOVE == op ) {
            return getDelegate().remove_(x, obj);
          }
          getLogger().error("Unsupported operation", op);
          throw new UnsupportedOperationException(op);
        } else {
          // service is null.
          getLogger().warning("ClusterConfigService not found, operation discarded.", obj);
          throw new RuntimeException("ClusterConfigService not found, operation discarded.");
        }
      `
    },
  ]
});
