/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaConsensusDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.NanoService'
  ],

  documentation: `Receive Entry's from the Nodes. Test for consensus on hash, cleanup, and notify.`,

  javaImports: [
    'foam.core.Agency',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.lib.json.JSONParser',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GTE',
    'static foam.mlang.MLang.NEQ',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.concurrent.atomic.AtomicInteger',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected Object indexLock_ = new Object();
  protected Object promoteLock_ = new Object();
  protected Object replayLock_ = new Object();
          `
        }));
      }
    }
  ],

  constants: [
    {
      documentation: 'starting at 2 as indexes 1 and 2 are used to prime the system.',
      name: 'INDEX_OFFSET',
      type: 'Long',
      value: 2
    }
  ],

  properties: [
    {
      name: 'index',
      class: 'Long',
      factory: function() { return this.INDEX_OFFSET; },
      javaFactory: 'return INDEX_OFFSET;',
      visibility: 'RO',
    },
    {
      name: 'replayIndex',
      class: 'Long',
      factory: function() { return this.INDEX_OFFSET; },
      javaFactory: 'return INDEX_OFFSET;',
      visibility: 'RO',
    },
    {
      name: 'replaying',
      class: 'Boolean',
      value: true,
      visibility: 'RO',
    },
    {
      name: 'replayNodes',
      class: 'Map',
      javaFactory: 'return new HashMap();',
      visibility: 'HIDDEN',
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      PM pm = createPM(x, "put");
      MedusaEntry entry = (MedusaEntry) obj;
      getLogger().debug("put", getIndex(), entry.getIndex(), entry.getNode());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      try {
        synchronized ( Long.toString(entry.getIndex()).intern() ) {
          if ( entry.getIndex() <= getIndex() ) {
            getLogger().debug("put", getIndex(), entry.getIndex(), entry.getNode(), "discarding", "in-lock");
            return entry;
          }

          MedusaEntry found = null;
//          MedusaEntry found = (MedusaEntry) getDelegate().find_(x, EQ(MedusaEntry.HASH, entry.getHash()));
          List<MedusaEntry> list = ((ArraySink) getDelegate()
            .where(
                EQ(MedusaEntry.HASH, entry.getHash())
              )
            .limit(1)
            .select(new ArraySink())).getArray();
          if ( list.size() > 0 ) {
            found = list.get(0);
          }

          if ( found == null ) {
            found = entry;
          } else {
            // freezing disabled.
            //found = (MedusaEntry) found.fclone();
          }
          found.setConsensusCount(found.getConsensusCount() + 1);
          entry = (MedusaEntry) getDelegate().put_(x, found);
          if ( entry.getConsensusCount() >= support.getNodeQuorum() ) {
            if ( entry.getIndex() == getIndex() + 1 ) {
              promote(x, entry);
            } else {
              getLogger().debug("put", getIndex(), entry.getIndex(), "promoter", "notify");
              synchronized ( promoteLock_ ) {
                promoteLock_.notify();
              }
            }
          }
          return entry;
        }
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( ! ( obj instanceof ReplayDetailsCmd ) ) {
        return getDelegate().cmd_(x, obj);
      }

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      DAO dao = (DAO) x.get("localClusterConfigDAO");
      ClusterConfig config = (ClusterConfig) dao.find(support.getConfigId()).fclone();
      ReplayDetailsCmd cmd = (ReplayDetailsCmd) obj;
      getLogger().debug("cmd", cmd);
      synchronized ( replayLock_ ) {
        if ( cmd.getMaxIndex() > getReplayIndex() ) {
          config.setReplayIndex(cmd.getMaxIndex());
          config = (ClusterConfig) dao.put(config);
          setReplayIndex(config.getReplayIndex());
        }
        getReplayNodes().put(cmd.getResponder(), cmd);
      }

      // if no replay data, then replay complete.
      getLogger().debug("cmd", "replayNodes", getReplayNodes().size(), "node quorum", support.getNodeQuorum(), "replayIndex", getReplayIndex(), "index", getIndex());
      if ( getReplayNodes().size() >= support.getNodeQuorum() &&
           getReplayIndex() <= getIndex() ) {
        getLogger().debug("cmd", "replayComplete");
        replayComplete(x);
      }
      return obj;
      `
    },
    {
      documentation: 'Make an entry available for Dagger hashing.',
      name: 'promote',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'entry',
          type: 'foam.nanos.medusa.MedusaEntry'
        }
      ],
      type: 'foam.nanos.medusa.MedusaEntry',
      javaCode: `
      PM pm = createPM(x, "promote");
      getLogger().debug("promote", getIndex(), entry.getIndex());
      try {
        DaggerService dagger = (DaggerService) x.get("daggerService");
        dagger.verify(x, entry);
        entry.setVerified(true);

        synchronized ( indexLock_ ) {
          if ( entry.getIndex() == getIndex() + 1 ) {
            setIndex(entry.getIndex());
          }
        }

        dagger.updateLinks(x, entry);

        if ( getReplaying() &&
             getIndex() >= getReplayIndex() ) {
          getLogger().debug("promote", "replayComplete");
          replayComplete(x);
        } else if ( getReplaying() ) {
          getLogger().debug("promote", "replay", getReplayIndex(), getReplaying());
        }

        entry = mdao(x, entry);

        // REVIEW: should delegate put (broadcast) occur before unblock?
        // Notify any blocked Primary puts
//        getLogger().debug("mdao", entry.getIndex(), "notify");
        ((DAO) x.get("localMedusaEntryDAO")).cmd_(x, entry);
//        getLogger().debug("mdao", entry.getIndex(), "notified");
      } finally {
        pm.log(x);
      }
      return (MedusaEntry) getDelegate().put_(x, entry);
      `
    },
    {
      documentation: 'NanoService implementation.',
      name: 'start',
      javaCode: `
      getLogger().debug("start");
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ((Agency) getX().get(support.getThreadPoolName())).submit(getX(), this, "Consensus Promoter");
      `
    },
    {
      documentation: 'ContextAgent implementation. Handling out of order consensus updates. Check if next (index + 1) has reach consensus and promote.',
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      getLogger().debug("promoter");
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      try {
        while ( true ) {
          List<MedusaEntry> list = ((ArraySink) getDelegate()
            .where(
              AND(
                EQ(MedusaEntry.INDEX, getIndex() + 1),
                GTE(MedusaEntry.CONSENSUS_COUNT, support.getNodeQuorum())
              ))
            .limit(1)
            .select(new ArraySink())).getArray();

          if ( list.size() > 0 ) {
            MedusaEntry entry = list.get(0);
            promote(x, entry);
          } else {
//            getLogger().debug("promoter", "lock", getIndex());
            synchronized ( promoteLock_ ) {
//              getLogger().debug("promoter", "wait", getIndex());
              promoteLock_.wait(1000);
//              getLogger().debug("promoter", "wake", getIndex());
            }
          }
        }
      } catch ( InterruptedException e ) {
        // nop
      } catch ( Exception e ) {
        getLogger().error("execute", e.getMessage(), e);
        // TODO: Alarm
      }
     `
    },
    {
      documentation: 'Make an entry available for Dagger hashing.',
      name: 'mdao',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'entry',
          type: 'foam.nanos.medusa.MedusaEntry'
        }
      ],
      type: 'foam.nanos.medusa.MedusaEntry',
      javaCode: `
      PM pm = createPM(x, "mdao");
      getLogger().debug("mdao", entry.getIndex());

      try {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());
        if ( getReplaying() ||
             ! config.getIsPrimary() ) {
          String data = entry.getData();
          getLogger().debug("mdao", entry.getIndex(), entry.getDop().getLabel(), data);
          if ( ! SafetyUtil.isEmpty(data) ) {
            FObject nu = x.create(JSONParser.class).parseString(entry.getData());
            if ( nu == null ) {
              getLogger().error("Failed to parse", entry.getIndex(), entry.getNSpecName(), entry.getData());
              throw new RuntimeException("Error parsing data.");
            }

            DAO dao = support.getMdao(x, entry.getNSpecName());
            FObject old = dao.find_(x, nu.getProperty("id"));
            if (  old != null ) {
              nu = old.fclone().copyFrom(nu);
            }

            if ( DOP.PUT == entry.getDop() ) {
              dao.put_(x, nu);
            } else if ( DOP.REMOVE == entry.getDop() ) {
              dao.remove_(x, nu);
            } else {
              getLogger().warning("Unsupported operation", entry.getDop().getLabel());
              throw new UnsupportedOperationException(entry.getDop().getLabel());
            }
          }
        }
      } catch (Throwable t) {
        getLogger().error(t);
        throw t;
        // TODO: Alarm
      } finally {
        pm.log(x);
      }
      return entry;
      `
    },
    {
      name: 'replayComplete',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      PM pm = createPM(x, "replayComplete");
      getLogger().debug("replayComplete");
      setReplaying(false);
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      DAO dao = (DAO) x.get("localClusterConfigDAO");
      ClusterConfig config = (ClusterConfig) dao.find(support.getConfigId()).fclone();
      config.setStatus(Status.ONLINE);
      dao.put(config);
      support.setIsReplaying(false);
      ((DAO) x.get("localMedusaEntryDAO")).cmd(new ReplayCompleteCmd());
      pm.log(x);
      `
    },
    {
      name: 'createPM',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'name',
          type: 'String'
        }
      ],
      javaType: 'PM',
      javaCode: `
      return PM.create(x, this.getOwnClassInfo(), name);
      `
    }
  ]
});
