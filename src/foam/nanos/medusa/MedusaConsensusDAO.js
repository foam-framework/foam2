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
    'foam.core.AgencyTimerTask',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.lib.json.JSONParser',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GT',
    'static foam.mlang.MLang.GTE',
    'static foam.mlang.MLang.MIN',
    'static foam.mlang.MLang.NEQ',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Min',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.concurrent.atomic.AtomicInteger',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'java.util.Timer'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected Object indexLock_ = new Object();
  protected Object promoteLock_ = new Object();
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
      name: 'timerInterval',
      class: 'Long',
      value: 10000
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      value: 60000
    },
    {
      name: 'promoterRunning',
      class: 'Boolean',
      value: false
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
      PM pm = PM.create(x, this.getOwnClassInfo(), "put");
      MedusaEntry entry = (MedusaEntry) obj;
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      getLogger().debug("put", getIndex(), replaying.getReplayIndex(), entry.getIndex(), entry.getNode());
      try {
        MedusaEntry existing = (MedusaEntry) getDelegate().find_(x, entry.getIndex());
        if ( existing != null &&
             existing.getPromoted() ) {
         getLogger().debug("put", getIndex(), entry.getIndex(), entry.getNode(), "discarding");
         return existing;
        }
        // Count count = (Count) getDelegate()
        //   .where(
        //     AND(
        //       EQ(MedusaEntry.INDEX, entry.getIndex()),
        //       EQ(MedusaEntry.PROMOTED, true)
        //     )
        //   )
        //   .select(COUNT());

        // if ( count.getValue() > 0 ) {
        //   getLogger().debug("put", getIndex(), entry.getIndex(), entry.getNode(), "discarding");
        //   return entry;
        // }

        synchronized ( Long.toString(entry.getIndex()).intern() ) {
          List<MedusaEntry> list = ((ArraySink) getDelegate()
            .where(
              AND(
                EQ(MedusaEntry.INDEX, entry.getIndex()),
                EQ(MedusaEntry.HASH, entry.getHash())
              )
            )
            .select(new ArraySink())).getArray();
          if ( list.size() > 0 ) {
            if ( list.size() > 1 ) {
              // TODO
            }
            existing = list.get(0);
          }
          if ( existing != null ) {
            if ( existing.getPromoted() ) {
              getLogger().debug("put", getIndex(), entry.getIndex(), entry.getNode(), "discarding", "in-lock");
              return entry;
            }
          } else {
            existing = entry;
          }

          List nodes = existing.getConsensusNodes();
          if ( ! nodes.contains(entry.getNode()) ) {
            nodes.add(entry.getNode());
            existing.setConsensusNodes(nodes);
          }
          existing.setConsensusCount(nodes.size());
          // existing.setConsensusCount(existing.getConsensusCount() + 1);
          entry = (MedusaEntry) getDelegate().put_(x, existing);
          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
          if ( entry.getConsensusCount() >= support.getNodeQuorum() &&
               entry.getIndex() == getIndex() + 1 ) {
            promote(x, entry);
          }
          return entry;
        }
      } finally {
        pm.log(x);
      }
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
      PM pm = PM.create(x, this.getOwnClassInfo(), "promote");
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      getLogger().debug("promote", entry.getIndex(), getIndex(), replaying.getReplayIndex(), replaying.getReplaying());
      try {

        DaggerService dagger = (DaggerService) x.get("daggerService");
        dagger.verify(x, entry);
        entry.setVerified(true);
        synchronized ( indexLock_ ) {
          if ( entry.getIndex() == getIndex() + 1 ) {
            setIndex(entry.getIndex());
            replaying.setIndex(getIndex());
            if ( replaying.getReplaying() &&
                 getIndex() >= replaying.getReplayIndex() ) {
              getLogger().debug("promote", "replayComplete", "index");
              ((DAO) x.get("localMedusaEntryDAO")).cmd(new ReplayCompleteCmd());
              // replayComplete(x);
            }
          }
        }

        dagger.updateLinks(x, entry);

        entry = mdao(x, entry);

        entry.setPromoted(true);
        entry = (MedusaEntry) getDelegate().put_(x, entry);

        // Notify any blocked Primary puts
        ((DAO) x.get("localMedusaEntryDAO")).cmd_(x, entry);
      } finally {
        pm.log(x);
      }
      return entry;
      `
    },
    {
      documentation: 'NanoService implementation.',
      name: 'start',
      javaCode: `
      getLogger().debug("start");
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      Timer timer = new Timer(this.getClass().getSimpleName());
      timer.scheduleAtFixedRate(
        new AgencyTimerTask(getX(), support.getThreadPoolName(), this),
        getInitialTimerDelay(),
        getTimerInterval());
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
      getLogger().debug("promoter", "execute");
      try {
        synchronized ( promoteLock_ ) {
          if ( getPromoterRunning() ) {
            getLogger().debug("promoter already running");
            return;
          }
          setPromoterRunning(true);
        }
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());
        while ( true ) {
          ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
          Long next = getIndex() + 1;
          getLogger().debug("promoter", next, "find");
          MedusaEntry entry = (MedusaEntry) getDelegate().find(next);
          if ( entry != null ) {
            if ( entry.getConsensusCount() < support.getNodeQuorum() ) {
              getLogger().warning("promoter", next, "no consensus", entry.getConsensusCount(), support.getNodeQuorum());
              entry = null;
            }
          } else {
            getLogger().warning("promoter", next, "not found");
            // // Possible holes, find next minimum index.
            // Min min = (Min) getDelegate()
            //   .where(
            //     AND(
            //       GT(MedusaEntry.INDEX, getIndex()),
            //       EQ(MedusaEntry.PROMOTED, false),
            //       GTE(MedusaEntry.CONSENSUS_COUNT, support.getNodeQuorum())
            //     ))
            //   .select(MIN(MedusaEntry.INDEX));
            // if ( min.getValue() != null &&
            //     ((Long) min.getValue()) > getIndex() ) {
            //   entry = (MedusaEntry) getDelegate().find((long) min.getValue());
            //   if ( entry != null ) {
            //     // Verify without failing - This entry may have consensus but
            //     // dependent on yet to arrive indexes.
            //     DaggerService dagger = (DaggerService) x.get("daggerService");
            //     try {
            //       dagger.verify(x, entry);
            //       getLogger().debug("promoter", getIndex(), entry.getIndex(),  "found,verified", "replayIndex", replaying.getReplayIndex());
            //       // ignore while testing this.
            //       entry = null;
            //     } catch (DaggerException e) {
            //       getLogger().debug("promoter", getIndex(), entry.getIndex(),  "found,NOT verified", "replayIndex", replaying.getReplayIndex());
            //       // ignore.
            //       entry = null;
            //     }
            //   }
            // } else {
            //   getLogger().debug("promoter", getIndex(), "> not found", "replayIndex", replaying.getReplayIndex());
            // }
         }
          if ( entry != null ) {
            getLogger().debug("promoter", next, "found", "promoting");
            promote(x, entry);
          } else {
            break;
          }
        }
      } catch ( Throwable e ) {
        getLogger().error("promoter", "execute", e.getMessage(), e);
        // TODO: Alarm
      } finally {
        getLogger().warning("promoter", "execute", "exit");
        synchronized ( promoteLock_ ) {
          setPromoterRunning(false);
        }
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
      PM pm = PM.create(x, this.getOwnClassInfo(), "mdao");
      getLogger().debug("mdao", entry.getIndex());

      try {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        if ( replaying.getReplaying() ||
             ! config.getIsPrimary() ) {
          String data = entry.getData();
          getLogger().debug("mdao", entry.getIndex(), entry.getDop().getLabel(), data);
          if ( ! SafetyUtil.isEmpty(data) ) {
            DAO dao = support.getMdao(x, entry.getNSpecName());
            Class cls = null;
            if ( dao instanceof foam.dao.ProxyDAO ) {
              cls = ((foam.dao.ProxyDAO) dao).getOf().getObjClass();
            } else if ( dao instanceof foam.dao.MDAO ) {
              cls = ((foam.dao.MDAO) dao).getOf().getObjClass();
            } else {
              getLogger().error("mdao", entry.getIndex(), entry.getNSpecName(), dao.getClass().getSimpleName(), "Unable to determine class", data);
              throw new RuntimeException("Error parsing data.");
            }
            FObject nu = x.create(JSONParser.class).parseString(entry.getData(), cls);
            if ( nu == null ) {
              getLogger().error("Failed to parse", entry.getIndex(), entry.getNSpecName(), cls, entry.getData());
              throw new RuntimeException("Error parsing data.");
            }

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

        // entry.setPromoted(true);
        // // Why am I clearing data? - Joel
        // // MedusaEntry.DATA.clear(entry);
        return entry;
      } catch (Throwable t) {
        getLogger().error(t);
        throw t;
        // TODO: Alarm
      } finally {
        pm.log(x);
      }
      `
    },
    // {
    //   name: 'replayComplete',
    //   args: [
    //     {
    //       name: 'x',
    //       type: 'Context'
    //     }
    //   ],
    //   javaCode: `
    //   // ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
    //   // replaying.setReplaying(false);
    //   // replaying.setEndTime(new java.util.Date());
    //   // getLogger().info("replayComplete", "duration", (replaying.getEndTime().getTime() - replaying.getStartTime().getTime())/ 1000, "s");
    //   // ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

    //   // DAO dao = (DAO) x.get("localClusterConfigDAO");
    //   // ClusterConfig config = (ClusterConfig) dao.find(support.getConfigId()).fclone();
    //   // config.setStatus(Status.ONLINE);
    //   // dao.put(config);

    //   ((DAO) x.get("localMedusaEntryDAO")).cmd(new ReplayCompleteCmd());
    //   `
    // }
  ]
});
