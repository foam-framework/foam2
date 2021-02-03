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
    'foam.util.SafetyUtil',
    'java.util.List'
  ],

  classes: [
    {
      documentation: `Model and DAO used to control access to the underlying MDAO on find/select calls when a put/remove is in-flight on the primary.`,
      name: 'IndexState',
      flags: ['java'],
      properties: [
        {
          name: 'id',
          class: 'Long'
        },
        {
          name: 'objId',
          class: 'Object'
        },
        {
          name: 'index',
          class: 'Long'
        },
        {
          name: 'state',
          class: 'Object'
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
      name: 'indexStateDAO',
      class: 'foam.dao.DAOProperty',
      javaFactory: `
      foam.dao.MDAO mdao = new foam.dao.MDAO(IndexState.getOwnClassInfo());
      mdao.addIndex(IndexState.INDEX);
      DAO dao = new foam.dao.SequenceNumberDAO.Builder(getX())
          .setDelegate(mdao)
          .build();
      dao = dao.orderBy(IndexState.ID);
      return dao;
      `
    },
    {
      documentation: `MDAO state used to calculate 'when' for find and select operations.`,
      name: 'state',
      class: 'Object'
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
      name: 'init_',
      javaCode: `
      getIndexStateDAO();
      `
    },
    {
      name: 'find_',
      javaCode: `
      DAO dao = getDelegate();
      if ( getState() != null ) {
        dao = (DAO) getDelegate().cmd_(x, new MDAO.GetWhenCmd(getState()));
      }
      return dao.find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
      DAO dao = getDelegate();
      if ( getState() != null ) {
        dao = (DAO) getDelegate().cmd_(x, new MDAO.GetWhenCmd(getState()));
      }
      return dao.select_(x, sink, skip, limit, order, predicate);
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
        IndexState indexState = new IndexState();
        indexState.setState(getDelegate().cmd_(x, MDAO.GET_STATE_CMD));
        if ( DOP.PUT == dop ) {
          nu = getDelegate().put_(x, obj);
          indexState.setObjId(nu.getProperty("id"));
          data = data(x, nu, old, dop);
        } else if ( DOP.REMOVE == dop ) {
          indexState.setObjId(obj.getProperty("id"));
          getDelegate().remove_(x, obj);
          data = data(x, obj, null, dop);
        }
        if ( SafetyUtil.isEmpty(data) ) {
          getLogger().debug("update", "primary", obj.getProperty("id"), "data", "no delta");
        } else {
          indexState = (IndexState) getIndexStateDAO().put_(x, indexState).fclone();
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
          indexState.setIndex(entry.getIndex());
          getIndexStateDAO().put_(x, indexState);
          promoteIndexState(x);
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
      if ( cmd.getMedusaEntryId() > 0 &&
          ((DAO) x.get("internalMedusaDAO")).find_(x,
              AND(
                EQ(MedusaEntry.INDEX, cmd.getMedusaEntryId()),
                EQ(MedusaEntry.PROMOTED, true)
              )) == null ) {
        getLogger().debug("update", dop.getLabel(), cmd.getMedusaEntryId(), "registry", "wait");
        MedusaRegistry registry = (MedusaRegistry) x.get("medusaRegistry");
        registry.wait(x, (Long) cmd.getMedusaEntryId());
        getLogger().debug("update", dop.getLabel(), cmd.getMedusaEntryId(), "registry", "unwait");
      } else {
        getLogger().debug("update", dop.getLabel(), cmd.getMedusaEntryId(), "promoted");
      }
      FObject result = cmd.getData();
      if ( DOP.PUT == dop ) {
        if ( result != null ) {
          FObject nu = getDelegate().find_(x, result.getProperty("id"));
          if ( nu == null ) {
            // REVIEW: Still not clear on the scenario for this.
            getLogger().error("update", dop.getLabel(), cmd.getMedusaEntryId(), "find", result.getProperty("id"), "null");
            nu = result;
          } else {
            // TODO: remove after further testing.
            FObjectFormatter formatter = formatter_.get();
            if ( formatter.maybeOutputDelta(result, nu) ) {
              getLogger().warning("update", dop.getLabel(), cmd.getMedusaEntryId(), "delta", formatter.builder().toString());
            }
          }
          return nu;
        }
        // TODO/REVIEW
        getLogger().error("update", dop.getLabel(), obj.getProperty("id"), "result,null");
      } else { // if ( DOP.REMOVE == dop ) {
        if ( getDelegate().find_(x, obj.getProperty("id")) != null ) {
          getLogger().error("update", dop.getLabel(), obj.getProperty("id"), "not deleted");
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
      if ( foam.dao.MDAO.GET_MDAO_CMD.equals(obj) ) {
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
            getLogger().debug("cmd", id, "registry", "wait");
            registry.wait(x, id);
            getLogger().debug("cmd", id, "registry", "unwait");
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
        getLogger().debug("submit", entry.getId(), "registry", "register");
        registry.register(x, (Long) entry.getId());
        PM pmPut = new PM(this.getClass().getSimpleName(), "submit", "put");
        entry = (MedusaEntry) getMedusaEntryDAO().put_(x, entry);
        pmPut.log(x);
        PM pmWait = new PM(this.getClass().getSimpleName(), "submit", "wait");
        getLogger().debug("submit", entry.getId(), "registry", "wait");
        registry.wait(x, (Long) entry.getId());
        getLogger().debug("submit", entry.getId(), "registry", "unwait");
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
      documentation: `Set the next available mdao state to be used for find/select calls`,
      name: 'promoteIndexState',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "promoteIndexState");
      try {
        // IndexStateDAO ordered in original 'put' order.
        // Any entries with an 'index' value can be removed, and
        // the first entry without an 'index' is the next, in order,
        // state which can be used for find/select.
        // If no unfinished entries found, then the find/select state
        // can be reset.

        Object state = null;
        List<IndexState> indexStates = (List) ((ArraySink) getIndexStateDAO().select_(x, new ArraySink(), 0, 0, null, null)).getArray();
        for ( IndexState indexState : indexStates ) {
          if ( indexState.getIndex() == 0 ) {
            state = indexState.getState();
            getLogger().debug("promoteIndexState", "found", indexState.getId());
            break;
          } else {
            getIndexStateDAO().remove_(x, indexState);
            getLogger().debug("promoteIndexState", "remove", indexState.getIndex());
          }
        }
        getLogger().debug("promoteIndexState", "state", state);
        setState(state);
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
