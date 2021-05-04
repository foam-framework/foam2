/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaAdapterDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Entry point into the Medusa system.
This DAO intercepts MDAO 'put' operations and creates a medusa entry for argument model.
It then marshalls it to the primary mediator, and waits on a response.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.dao.MDAO',
    'foam.dao.RemoveSink',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.log.LogLevel',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.util.List'
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
      formatter.setOutputShortNames(true);
      formatter.setOutputClassNames(false);
      formatter.setOutputDefaultClassNames(false);
      formatter.setPropertyPredicate(
        new foam.lib.AndPropertyPredicate(new foam.lib.PropertyPredicate[] {
          new foam.lib.StoragePropertyPredicate(),
          new foam.lib.ClusterPropertyPredicate()
        }));
      formatter.setCalculateNestedDelta(false);
      return formatter;
    }

    @Override
    public FObjectFormatter get() {
      FObjectFormatter formatter = super.get();
      formatter.reset();
      return formatter;
    }
  };

  protected static final ThreadLocal<FObjectFormatter> transientFormatter_ = new ThreadLocal<FObjectFormatter>() {
    @Override
    protected JSONFObjectFormatter initialValue() {
      JSONFObjectFormatter formatter = new JSONFObjectFormatter();
      formatter.setOutputShortNames(true);
      formatter.setOutputClassNames(false);
      formatter.setOutputDefaultClassNames(false);
      formatter.setPropertyPredicate(
        new foam.lib.AndPropertyPredicate(new foam.lib.PropertyPredicate[] {
          new foam.lib.StorageTransientPropertyPredicate(),
          new foam.lib.ClusterPropertyPredicate()
        }));
      formatter.setCalculateNestedDelta(false);
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
      name: 'removeAll_',
      javaCode: `
      getDelegate().select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
      `
    },
    {
      documentation: 'Route DAO operation to primary mediator',
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
      if ( ! ( DOP.PUT == dop ||
               DOP.REMOVE == dop ) ) {
        getLogger().warning("update", "Unsupported operation", dop.getLabel());
        throw new UnsupportedOperationException(dop.getLabel());
      }

      if ( obj instanceof Clusterable &&
           ! ((Clusterable) obj).getClusterable() ) {
        getLogger().debug("update", dop.getLabel(), "not clusterable", obj.getClass().getSimpleName(), obj.getProperty("id"));
        if ( DOP.PUT == dop ) return getDelegate().put_(x, obj);
        if ( DOP.REMOVE == dop ) return getDelegate().remove_(x, obj);
      }

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());

      if ( config.getIsPrimary() ) {
        return updatePrimary(x, obj, dop);
      }
      return updateSecondary(x, obj, dop);
    `
    },
    {
      documentation: `Secondary flow: proxy to next server, wait on own mdao update.`,
      name: 'updateSecondary',
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
      ClusterCommand cmd = new ClusterCommand(x, getNSpec().getName(), dop, obj);
      getLogger().debug("update", "secondary", dop, obj.getProperty("id"), "send");
      PM pm = PM.create(x, this.getClass().getSimpleName(), "secondary", "cmd");
      cmd = (ClusterCommand) getClientDAO().cmd_(x, cmd);
      pm.log(x);
      cmd.logHops(x);
      getLogger().debug("update", "secondary", dop, obj.getProperty("id"), "receive", cmd.getMedusaEntryId());
      if ( cmd.getMedusaEntryId() > 0 ) {
        pm = PM.create(x, this.getClass().getSimpleName(), "secondary", "registry", "wait");
        MedusaRegistry registry = (MedusaRegistry) x.get("medusaRegistry");
        registry.wait(x, (Long) cmd.getMedusaEntryId());
        pm.log(x);
      }
      FObject result = cmd.getData();
      if ( DOP.PUT == dop ) {
        if ( result != null ) {
          FObject nu = getDelegate().find_(x, result.getProperty("id"));
          if ( nu == null ) {
            getLogger().error("update", "secondary", dop, obj.getProperty("id"), "delegate", cmd.getMedusaEntryId(), "find", result.getProperty("id"), "null");
            Alarm alarm = new Alarm();
            alarm.setClusterable(false);
            alarm.setSeverity(LogLevel.ERROR);
            alarm.setName("MedusaAdapter secondary failed - find");
            alarm.setNote(obj.getClass().getName()+" "+obj.getProperty("id"));
            alarm = (Alarm) ((DAO) x.get("alarmDAO")).put(alarm);
          } else {
            return nu;
          }
        }

        getLogger().error("update", "secondary", dop, obj.getProperty("id"), "result,null");
        Alarm alarm = new Alarm();
        alarm.setClusterable(false);
        alarm.setSeverity(LogLevel.ERROR);
        alarm.setName("MedusaAdapter secondary failed - put");
        alarm.setNote(obj.getClass().getName()+" "+obj.getProperty("id"));
        alarm = (Alarm) ((DAO) x.get("alarmDAO")).put(alarm);
      } else if ( DOP.REMOVE == dop ) {
        if ( getDelegate().find_(x, obj.getProperty("id")) != null ) {
          getLogger().error("update", "secondary", dop, obj.getProperty("id"), "delegate", "not deleted");
          Alarm alarm = new Alarm();
          alarm.setClusterable(false);
          alarm.setSeverity(LogLevel.ERROR);
          alarm.setName("MedusaAdapter secondary failed - remove");
          alarm.setNote(obj.getClass().getName()+" "+obj.getProperty("id"));
          alarm = (Alarm) ((DAO) x.get("alarmDAO")).put(alarm);
          return getDelegate().remove_(x, obj);
        }
      }
      return result;
      `
    },
    {
      documentation: 'Primary flow: put to delegate/MDAO, then submit to nodes, wait on MedusaEntry consensus.',
      name: 'updatePrimary',
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
      PM pm = PM.create(x, this.getClass().getSimpleName(), "primary");
      ClusterCommand cmd = null;
      if ( obj instanceof ClusterCommand ) {
        cmd = (ClusterCommand) obj;
        obj = cmd.getData();
      }

      try {
        if ( DOP.PUT == dop ) {
          Object id = obj.getProperty("id");
          FObject old = getDelegate().find_(x, id);
          FObject nu = getDelegate().put_(x, obj);
          String data = data(x, nu, old, dop);
          String transientData = transientData(x, nu, old, dop);
          if ( ! SafetyUtil.isEmpty(data) ||
               ! SafetyUtil.isEmpty(transientData) ) {
            MedusaEntry entry = (MedusaEntry) submit(x, data, transientData, dop);
            getLogger().debug("updatePrimary", "primary", dop, nu.getProperty("id"), "entry", entry.toSummary());
            if ( cmd != null ) {
              cmd.setMedusaEntryId((Long) entry.getId());
            }
          }
          if ( cmd != null ) {
            cmd.setData(nu);
            return cmd;
          }
          return nu;
        }
        // DOP.REMOVE
        FObject result = getDelegate().remove_(x, obj);
        String data = data(x, obj, null, dop);
        MedusaEntry entry = (MedusaEntry) submit(x, data, null, dop);
        if ( cmd != null ) {
          cmd.setMedusaEntryId((Long) entry.getId());
          cmd.setData(result);
          return cmd;
        }
        return result;
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( foam.dao.DAO.LAST_CMD.equals(obj) ) {
        return getDelegate();
      }
      if ( obj instanceof ClusterCommand ) {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());
        ClusterCommand cmd = (ClusterCommand) obj;

        if ( config.getIsPrimary() ) {
          if ( DOP.PUT == cmd.getDop() ) {
            return put_(x, cmd);
          }
          if ( DOP.REMOVE == cmd.getDop() ) {
            return remove_(x, cmd);
          }
          getLogger().warning("Unsupported operation", cmd.getDop().getLabel());
          throw new UnsupportedOperationException(cmd.getDop().getLabel());
        }

        cmd = (ClusterCommand) getClientDAO().cmd_(x, obj);

        if ( config.getType() == MedusaType.MEDIATOR ) {
          Long id = cmd.getMedusaEntryId();
          if ( id != null &&
               id > 0L ) {
            MedusaRegistry registry = (MedusaRegistry) x.get("medusaRegistry");
            registry.wait(x, id);
          }
        }
        return cmd;
      }
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
          formatter.maybeOutputDelta(old, obj);
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
      name: 'transientData',
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
      PM pm = PM.create(x, this.getClass().getSimpleName(), "transientData");
      try {
        FObjectFormatter transientFormatter = transientFormatter_.get();
        if ( old != null ) {
          if ( ! transientFormatter.maybeOutputDelta(old, obj) ) {
            return null;
          }
          return transientFormatter.builder().toString();
        } else {
          transientFormatter.output(obj);
          String data = transientFormatter.builder().toString();
          if ( SafetyUtil.isEmpty(data) ||
               "{}".equals(data) ) {
            return null;
          }
          return data;
        }
      } finally {
        pm.log(x);
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
          name: 'data',
          type: 'String'
        },
        {
          name: 'transientData',
          type: 'String'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        }
      ],
      type: 'FObject',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "submit");
      MedusaEntry entry = x.create(MedusaEntry.class);
      try {
        PM pmLink = new PM(this.getClass().getSimpleName(), "submit", "link");
        DaggerService dagger = (DaggerService) x.get("daggerService");
        entry = dagger.link(x, entry);
        entry.setNSpecName(getNSpec().getName());
        entry.setDop(dop);
        entry.setData(data);
        if ( ! SafetyUtil.isEmpty(transientData) ) {
          entry.setTransientData(transientData);
        }
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
