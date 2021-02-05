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
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.List',
    'foam.util.SafetyUtil',
    'java.util.concurrent.ConcurrentLinkedDeque',
  ],

  classes: [
    {
      name: 'WriteLock',
      properties: [
        {
          name: 'complete',
          class: 'Boolean'
        }
      ]
    }
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

  // TODO: pool of reusable WriteLocks
  protected Map<Object, WriteLock> findLocks_ = new HashMap();
  protected ConcurrentLinkedDeque selectLocks_ = new ConcurrentLinkedDeque();
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
      WriteLock findLock = findLocks_.get(id);
      if ( findLock != null &&
           ! findLock.getComplete() ) {
        synchronized ( findLock ) {
          while ( ! findLock.getComplete() ) {
            try {
              findLock.wait(1000L);
            } catch (InterruptedException e) {
              break;
            }
          }
        }
      }
      return getDelegate().find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
      WriteLock lock = (WriteLock) selectLocks_.peekLast();
      if ( lock != null &&
           ! lock.getComplete() ) {
        synchronized ( lock ) {
          while ( ! lock.getComplete() ) {
              try {
                lock.wait(1000L);
              } catch (InterruptedException e) {
                break;
              }
          }
        }
      }
      return getDelegate().select_(x, sink, skip, limit, order, predicate);
      `
    },
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


      // Primary
      // put to MDAO, then submit to nodes

      if ( config.getIsPrimary() ) {

        ClusterCommand cmd = null;
        if ( obj instanceof ClusterCommand ) {
          cmd = (ClusterCommand) obj;
          obj = cmd.getData();
        }

        getLogger().debug("update", "primary", dop, obj.getClass().getSimpleName());
        // TODO: create a pool of WriteLock to reuse
        WriteLock selectLock = new WriteLock();
        selectLocks_.add(selectLock);
        WriteLock findLock = null;
        try {
        if ( DOP.PUT == dop ) {
          FObject old = getDelegate().find_(x, obj.getProperty("id"));
          if ( old != null ) {
            findLock = new WriteLock();
            findLocks_.put(obj.getProperty("id"), findLock);
          }
          FObject nu = getDelegate().put_(x, obj);
          String data = data(x, nu, old, dop);
          // data will be empty if only changes are storageTransient.
          if ( ! SafetyUtil.isEmpty(data) ) {
            MedusaEntry entry = (MedusaEntry) submit(x, data, dop);
            getLogger().debug("update", "primary", dop, obj.getProperty("id"), "entry", entry.toSummary());
            if ( cmd != null ) {
              cmd.setMedusaEntryId((Long) entry.getId());
            }
          }
          if ( cmd != null ) {
            cmd.setData(nu);
            return cmd;
          }
          return nu;
        } else if ( DOP.REMOVE == dop ) {
          FObject result = getDelegate().remove_(x, obj);
          String data = data(x, obj, null, dop);
          MedusaEntry entry = (MedusaEntry) submit(x, data, dop);
          if ( cmd != null ) {
            cmd.setMedusaEntryId((Long) entry.getId());
            cmd.setData(result);
            return cmd;
          }
          return result;
        }
        } finally {
          if ( findLock != null ) {
            synchronized ( findLock ) {
              findLock.setComplete(true);
              findLock.notifyAll();
            }
            findLocks_.remove(findLock);
          }
          selectLock.setComplete(true);
          notifySelectors(x);
        }
      }


      // Secondary
      // send cmd to Primary

      ClusterCommand cmd = new ClusterCommand(x, getNSpec().getName(), dop, obj);
      getLogger().debug("update", "secondary", dop.getLabel(), "client", "cmd", obj.getProperty("id"), "send");
      // PM pm = PM.create(x, this.getClass().getSimpleName(), "cmd");
      PM pm = new PM(this.getClass().getSimpleName(), "cmd");
      cmd = (ClusterCommand) getClientDAO().cmd_(x, cmd);
      pm.log(x);
      cmd.logHops(x);
      getLogger().debug("update", "secondary", dop.getLabel(), "client", "cmd", obj.getProperty("id"), "receive", cmd.getMedusaEntryId());
     if ( cmd.getMedusaEntryId() > 0 ) {
        getLogger().debug("update", "secondary", dop.getLabel(), cmd.getMedusaEntryId(), "registry", "wait");
        MedusaRegistry registry = (MedusaRegistry) x.get("medusaRegistry");
        registry.wait(x, (Long) cmd.getMedusaEntryId());
        getLogger().debug("update", "secondary", dop.getLabel(), cmd.getMedusaEntryId(), "registry", "unwait");
      } else {
        getLogger().debug("update", "secondary", dop.getLabel(), cmd.getMedusaEntryId(), "promoted");
      }
      FObject result = cmd.getData();
      if ( DOP.PUT == dop ) {
        if ( result != null ) {
          FObject nu = getDelegate().find_(x, result.getProperty("id"));
          if ( nu == null ) {
            // TODO/REVIEW - still occuring?
            getLogger().error("update", "secondary", dop.getLabel(), cmd.getMedusaEntryId(), "find", result.getProperty("id"), "null");
          }
          // put again to update storageTransient properties
          return getDelegate().put_(x, result);
        }
        // TODO/REVIEW
        getLogger().error("update", "secondary", dop.getLabel(), obj.getProperty("id"), "result,null");
      } else { // if ( DOP.REMOVE == dop ) {
        if ( getDelegate().find_(x, obj.getProperty("id")) != null ) {
          getLogger().error("update", "secondary", dop.getLabel(), obj.getProperty("id"), "not deleted");
          return getDelegate().remove_(x, obj);
        }
      }
      return result;
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      getLogger().debug("cmd");
      if ( foam.dao.DAO.LAST_CMD.equals(obj) ) {
        return getDelegate();
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
    },
    {
      documentation: 'Notify waiters on select locks - in order',
      name: 'notifySelectors',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      if ( ! selectLocks_.isEmpty() ) {
        PM pm = PM.create(x, this.getClass().getSimpleName(), "notifySelectors");
        try {
          while ( ! selectLocks_.isEmpty() ) {
            synchronized ( selectLocks_ ) {
              WriteLock selectLock = (WriteLock) selectLocks_.peek();
              if ( selectLock == null ||
                   ! selectLock.getComplete() ) {
                break;
              } else if ( selectLock.getComplete() ) {
                selectLocks_.poll();
                synchronized ( selectLock ) {
                  selectLock.notifyAll();
                }
              }
            }
          }
        } finally {
          pm.log(x);
        }
      }
      `
    }
  ]
});
