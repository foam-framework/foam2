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
      name: 'put_',
      javaCode: `
      return update(x, obj, DOP.PUT);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      return update(x, obj, DOP.REMOVE);
      `
    },
    {
      documentation: `
      1. If primary mediator, then delegate to medusaAdapter, accept result.
      2. If secondary mediator, proxy to next 'server', find result.
      3. If not mediator, proxy to the next 'server', put result.`,
      name: 'update',
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
      getLogger().debug("update");
      if ( ! ( DOP.PUT == dop ||
               DOP.REMOVE == dop ) ) {
        getLogger().warning("Unsupported operation", dop.getLabel());
        throw new UnsupportedOperationException(dop.getLabel());
      }

      if ( obj instanceof Clusterable &&
           ! ((Clusterable) obj).getClusterable() ) {
        getLogger().debug("update", dop.getLabel(), "not clusterable", obj.getClass().getSimpleName(), obj.getProperty("id").toString());
        if ( DOP.PUT == dop ) return getDelegate().put_(x, obj);
        if ( DOP.REMOVE == dop ) return getDelegate().remove_(x, obj);
      }

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());


      if ( config.getIsPrimary() ) {
        // Primary instance - put to MDAO (delegate)

        ClusterCommand cmd = null;
        if ( obj instanceof ClusterCommand ) {
          cmd = (ClusterCommand) obj;
          obj = cmd.getData();
        }

        getLogger().debug("update", dop.getLabel(), "primary", obj.getClass().getSimpleName());
        FObject old = getDelegate().find_(x, obj.getProperty("id"));
        FObject nu = null;
        String data = null;
        if ( DOP.PUT == dop ) {
          nu = getDelegate().put_(x, obj);
          data = data(x, nu, old, dop);
        } else if ( DOP.REMOVE == dop ) {
          getDelegate().remove_(x, obj);
          data = data(x, obj, null, dop);
        }
        if ( SafetyUtil.isEmpty(data) ) {
          getLogger().debug("update", "primary", obj.getProperty("id"), "data", "no delta");
        } else {
          MedusaEntry entry = (MedusaEntry) submit(x, data, dop);
          if ( cmd != null ) {
            getLogger().debug("update", "primary", obj.getProperty("id"), "setMedusaEntryId", entry.toSummary());
            cmd.setMedusaEntryId((Long) entry.getId());
            if ( DOP.PUT == dop ) {
              cmd.setData(nu);
            } else if ( DOP.REMOVE == dop ) {
              cmd.setData(null);
            }
          }
        }
        if ( cmd != null ) {
          return cmd;
        }
        return nu;
      }

      ClusterCommand cmd = new ClusterCommand(x, getNSpec().getName(), dop, obj);
      getLogger().debug("update", dop.getLabel(), "client", "cmd", obj.getProperty("id"), "send");
      // PM pm = PM.create(x, this.getClass().getSimpleName(), "cmd");
      PM pm = new PM(this.getClass().getSimpleName(), "cmd");
      cmd = (ClusterCommand) getClientDAO().cmd_(x, cmd);
      pm.log(x);
      cmd.logHops(x);
      getLogger().debug("update", dop.getLabel(), "client", "cmd", obj.getProperty("id"), "receive", cmd.getMedusaEntryId());
      if ( DOP.PUT == dop ) {
        FObject result = cmd.getData();
        if ( result != null ) {
          FObject nu = getDelegate().put_(x, result);
          if ( nu == null ) {
            getLogger().debug("update", dop.getLabel(), "delegate", "put", result.getProperty("id"), "null");
          } else {
            FObject f = getDelegate().find_(x, nu.getProperty("id"));
            if ( f == null ) {
              getLogger().warning("update", dop.getLabel(), "delegate", "find", result.getProperty("id"), "null");
            }
          }
          return nu;
        }
        // TODO/REVIEW
        getLogger().warning("update", dop.getLabel(), obj.getProperty("id"), "result,null");
        return result;
      } else { // if ( DOP.REMOVE == dop ) {
        FObject r = getDelegate().remove_(x, obj);
        FObject f = getDelegate().find_(x, obj.getProperty("id"));
        if ( f != null ) {
          // TODO/REVIEW
          getLogger().warning("update", dop.getLabel(), "delegate", "find", obj.getProperty("id"), "not null");
        }
        return r;
      }
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      getLogger().debug("cmd");
      if ( foam.dao.MDAO.GET_MDAO_CMD.equals(obj) ) {
        return this;
        // return getDelegate().cmd_(x, obj);
      }
      if ( obj instanceof ClusterCommand ) {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());
        ClusterCommand cmd = (ClusterCommand) obj;

        if ( config.getIsPrimary() ) {
          getLogger().debug("cmd", "ClusterCommand", "primary");
          if ( DOP.PUT == cmd.getDop() ) {
            return put_(x, cmd);
          } else if ( DOP.REMOVE == cmd.getDop() ) {
            return remove_(x, cmd);
          } else {
            getLogger().warning("Unsupported operation", cmd.getDop().getLabel());
            throw new UnsupportedOperationException(cmd.getDop().getLabel());
          }
        }

        getLogger().debug("cmd", "ClusterCommand", "non-primary");
        cmd = (ClusterCommand) getClientDAO().cmd_(x, obj);

        if ( config.getType() == MedusaType.MEDIATOR ) {
          Long id = cmd.getMedusaEntryId();
          if ( id != null &&
               id > 0L ) {
            MedusaRegistry registry = (MedusaRegistry) x.get("medusaRegistry");
            registry.wait(x, id);
          } else {
            getLogger().debug("cmd", "ClusterCommand", "medusaEntry", "null");
          }
        }
        getLogger().debug("cmd", "ClusterCommand", "return");
        return cmd;
      }
      getLogger().debug("cmd", "getClientDAO");
      return getClientDAO().cmd_(x, obj);
      `
    },
    {
      name: 'data',
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
      type: 'String',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "data");
      String data = null;
      try {
        FObjectFormatter formatter = formatter_.get();
        if ( old != null ) {
          formatter.outputDelta(old, obj);
        } else {
          formatter.output(obj);
        }
        data = formatter.builder().toString();
      } finally {
        pm.log(x);
      }
      return data;
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
          name: 'data',
          type: 'String'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        }
      ],
      type: 'FObject',
      javaCode: `
      // PM pm = PM.create(x, this.getClass().getSimpleName(), "submit");
      PM pm = new PM(this.getClass().getSimpleName(), "submit");
      MedusaEntry entry = x.create(MedusaEntry.class);
      try {
        PM pmLink = new PM(this.getClass().getSimpleName(), "submit", "link");
        DaggerService dagger = (DaggerService) x.get("daggerService");
        entry = dagger.link(x, entry);
        entry.setNSpecName(getNSpec().getName());
        entry.setDop(dop);
        entry.setData(data);
        pmLink.log(x);

        getLogger().debug("submit", entry.getId());

        MedusaRegistry registry = (MedusaRegistry) x.get("medusaRegistry");
        registry.register(x, (Long) entry.getId());
        PM pmPut = new PM(this.getClass().getSimpleName(), "submit", "put");
        entry = (MedusaEntry) getMedusaEntryDAO().put_(x, entry);
        pmPut.log(x);
        PM pmWait = new PM(this.getClass().getSimpleName(), "submit", "wait");
        registry.wait(x, (Long) entry.getId());
        pmWait.log(x);
        return entry;
      } catch (Throwable t) {
        pm.error(x, entry.toSummary(), t);
        getLogger().error("submit", entry.toSummary(), t.getMessage(), t);
        throw t;
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
