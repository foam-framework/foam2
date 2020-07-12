/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaAdapterDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
//    'foam.nanos.boot.NSpecAware',
  ],

  documentation: `Create a medusa entry for argument model.`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DOP',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      of: 'foam.nanos.boot.NSpec'
    },
    {
      name: 'medusaEntryDAO',
      class: 'FObjectProperty',
      of: 'foam.dao.DAO',
      javaFactory: 'return (foam.dao.DAO) getX().get("localMedusaEntryDAO");'
    },
    {
      name: 'clientDAO',
      class: 'FObjectProperty',
      of: 'foam.dao.DAO',
      javaFactory: `
      return new foam.nanos.medusa.ClusterClientDAO.Builder(getX())
        .setNSpec(getNSpec())
        .setDelegate(new foam.dao.NullDAO(getX(), getDelegate().getOf()))
        .build();
      `
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

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected static final ThreadLocal<FObjectFormatter> formatter_ = new ThreadLocal<FObjectFormatter>() {
    @Override
    protected JSONFObjectFormatter initialValue() {
      JSONFObjectFormatter formatter = new JSONFObjectFormatter();
      formatter.setQuoteKeys(false); // default
      formatter.setOutputShortNames(true); // default
      formatter.setOutputDefaultValues(true);
      formatter.setOutputClassNames(true); // default
      formatter.setOutputDefaultClassNames(true); // default
      formatter.setOutputReadableDates(false);
      formatter.setPropertyPredicate(new foam.lib.StoragePropertyPredicate());
      return formatter;
    }

    @Override
    public FObjectFormatter get() {
      FObjectFormatter formatter = super.get();
      formatter.reset();
      return formatter;
    }
  };
          `
        }));
      }
    }
  ],

  methods: [
    {
      documentation: `
      1. If primary mediator, then delegate to medusaAdapter, accept result.
      2. If secondary mediator, proxy to next 'server', find result.
      3. If not mediator, proxy to the next 'server', put result.`,
      name: 'put_',
      javaCode: `
       // TODO/REVIEW: does Clusterable make sense?
      if ( obj instanceof Clusterable &&
           ! ((Clusterable) obj).getClusterable() ) {
        getLogger().debug("put", "not clusterable", obj.getProperty("id"));
        return getDelegate().put_(x, obj);
      }

      if ( obj instanceof ClusterCommand ) {
        // See ClusterServerDAO which searches the DAO stack for a
        // Client. This DAO will return itself as the Client when isPrimary.
        // ClusterServerDAO will then pass the cmd to the Client.
        obj = ((ClusterCommand) obj).getData();
      }

      // Primary instance - put to MDAO (delegate)
      if ( getConfig().getIsPrimary() ) {
        getLogger().debug("put", "primary", obj.getClass().getSimpleName(), obj.getProperty("id"));
        FObject old = getDelegate().find_(x, obj.getProperty("id"));
        FObject nu = getDelegate().put_(x, obj);
        return submit(x, nu, old, DOP.PUT);
      }

      // Not primary - pass on to next Mediator.
      getLogger().debug("put", "client", obj.getProperty("id"));
      FObject result = getClientDAO().put_(x, obj);
      if ( getConfig().getType() == MedusaType.MEDIATOR ) {
        FObject found = getDelegate().find_(x, obj.getProperty("id"));
        if ( found == null) {
          // FIXME: In Zone 1+, it would appear the client returns before the broadcast finishes.
          getLogger().error("put", "client", "delegate.find", "NOT FOUND", obj.getProperty("id"));
          return result;
        }
        return found;
      }
      // Fall through when not Mediator and update local MDAO (delegate).
      getLogger().debug("put", "client", "delegate.put", obj.getProperty("id"));
      return getDelegate().put_(x, result);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      // TODO/REVIEW: does Clusterable make sense?
      if ( obj instanceof Clusterable &&
           ! ((Clusterable) obj).getClusterable() ) {
        return getDelegate().remove_(x, obj);
      }

      if ( obj instanceof ClusterCommand ) {
        obj = ((ClusterCommand) obj).getData();
      }

      if ( getConfig().getIsPrimary() ) {
        getDelegate().remove_(x, obj);
        return submit(x, obj, null, DOP.REMOVE);
      }

      FObject result = getClientDAO().remove_(x, obj);
      if ( getConfig().getType() == MedusaType.MEDIATOR ) {
        return result;
      }
      return getDelegate().remove_(x, result);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      getLogger().debug("cmd");
       if ( foam.dao.MDAO.GET_MDAO_CMD.equals(obj) ) {
        return getDelegate().cmd_(x, obj);
      }
      if ( getConfig().getIsPrimary() ) {
        if ( ClusterServerDAO.GET_CLIENT_CMD.equals(obj) ) {
          getLogger().debug("cmd", "GET_CLIENT_CMD", "this");
          return this;
        }
        if ( obj instanceof ClusterCommand ) {
          ClusterCommand cmd = (ClusterCommand) obj;
          getLogger().debug("cmd", "ClusterCommand");

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
      }
      getLogger().debug("cmd", "getClientDAO");
      return getClientDAO().cmd_(x, obj);
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
          type: 'FObject'
        },
        {
          name: 'old',
          type: 'FObject'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        }
      ],
      type: 'FObject',
      javaCode: `
      getLogger().debug("submit", dop.getLabel(), obj.getClass().getName());

      DaggerService dagger = (DaggerService) x.get("daggerService");
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());

      PM pm = PM.create(x, this.getOwnClassInfo(), "formatter");
      String data = null;
      try {
        FObjectFormatter formatter = formatter_.get();
        if ( old != null ) {
          formatter.outputDelta(old, obj);
        } else {
          formatter.output(obj);
        }
        data = formatter.builder().toString();
        if ( SafetyUtil.isEmpty(data) ) {
          getLogger().info("submit", obj.getClass().getSimpleName(), "data,empty");
          return obj;
        }
      } finally {
        pm.log(x);
      }

      pm = PM.create(x, this.getOwnClassInfo(), dop.getLabel());
      MedusaEntry entry = x.create(MedusaEntry.class);
      try {
        entry = dagger.link(x, entry);
        entry.setMediator(config.getName());
        entry.setNSpecName(getNSpec().getName());
        entry.setDop(dop);
        entry.setData(data);

        getLogger().debug("submit", entry.getIndex(), obj.getClass().getSimpleName(), "stringify", entry.getData());

        FObject result = getMedusaEntryDAO().put_(x, entry); // blocking
        FObject nu = getDelegate().find_(x, obj.getProperty("id"));
        if ( nu == null ) {
          getLogger().error("submit", entry.getIndex(), "delegate", "find", obj.getProperty("id"), "not found");
          throw new RuntimeException("Object not found.");
        }
        return nu;
      } catch (Throwable t) {
        getLogger().error("submit", entry.getIndex(), t.getMessage(), t);
        throw t;
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
