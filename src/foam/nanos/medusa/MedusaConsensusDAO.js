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
    'java.util.Arrays',
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
      PM pm = PM.create(x, this.getClass().getSimpleName(), "put");
      MedusaEntry entry = (MedusaEntry) obj;
      Object id = entry.getProperty("id");
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      getLogger().debug("put", getIndex(), replaying.getReplayIndex(), entry.toSummary(), entry.getNode());

      try {
        MedusaEntry existing = (MedusaEntry) getDelegate().find_(x, id);
        if ( existing != null &&
             existing.getPromoted() ) {
         getLogger().debug("put", getIndex(), entry.toSummary(), entry.getNode(), "discarding");
         return existing;
        }

        synchronized ( id.toString().intern() ) {
          existing = (MedusaEntry) getDelegate().find_(x, id);
          if ( existing != null ) {
            if ( existing.getPromoted() ) {
              getLogger().debug("put", getIndex(), entry.toSummary(), entry.getNode(), "discarding", "in-lock");
              return entry;
            }
          } else {
            existing = entry;
          }

          // NOTE: all this business with the nested Maps to avoid
          // a mulitipart id (index,hash) on MedusaEntry, as presently
          // it is a huge performance impact.
          Map<Object, Map> hashes = existing.getConsensusHashes();
          Map nodes = hashes.get(entry.getNode());
          if ( nodes == null ) {
            nodes = new HashMap<String, Object>();
            hashes.put(entry.getHash(), nodes);
          }
          if ( nodes.get(entry.getNode()) == null ) {
            // getLogger().debug("put", "nodes", "put", entry.toSummary(), entry.getNode());
            nodes.put(entry.getNode(), entry);
          }
          hashes.put(entry.getHash(), nodes);
          existing.setConsensusHashes(hashes);
          existing = (MedusaEntry) getDelegate().put_(x, existing);
          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
          if ( nodes.size() >= support.getNodeQuorum() &&
               entry.getIndex() == getIndex() + 1 ) {
            entry.setConsensusCount(nodes.size());
            entry.setConsensusNodes(nodes.entrySet().toArray());
            MedusaEntry.CONSENSUS_HASHES.clear(entry);
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
//      getLogger().debug("promote", entry.getIndex(), getIndex(), replaying.getReplayIndex(), replaying.getReplaying());
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
              getLogger().info("promote", "replayComplete", "index");
              ((DAO) x.get("localMedusaEntryDAO")).cmd(new ReplayCompleteCmd());
            }
          }
        }

        dagger.updateLinks(x, entry);

        entry = mdao(x, entry);

        entry.setPromoted(true);
        entry = (MedusaEntry) getDelegate().put_(x, entry);

        // Notify any blocked Primary puts
        MedusaRegistry registry = (MedusaRegistry) x.get("medusaRegistry");
        registry.notify(x, entry);
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
          MedusaEntry entry = null;
          ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
          if ( replaying.getReplaying() &&
               getIndex() >= replaying.getReplayIndex() ) {
            ((DAO) x.get("localMedusaEntryDAO")).cmd(new ReplayCompleteCmd());
          }

          Long nextIndex = getIndex() + 1;
          MedusaEntry next = (MedusaEntry) getDelegate().find_(x, nextIndex);
          if ( next != null ) {
            Map<Object, Map> hashes = next.getConsensusHashes();
            for ( Map nodes : hashes.values() ) {
              if ( nodes.size() >= support.getNodeQuorum() ) {
                if ( entry == null ) {
                  entry = next;
                  entry.setConsensusCount(nodes.size());
                  entry.setConsensusNodes(nodes.entrySet().toArray());
                  MedusaEntry.CONSENSUS_HASHES.clear(entry);
                  promote(x, entry);
                } else {
                  getLogger().error("promoter", next, "multiple found with consensus", next.toSummary(), next.getConsensusCount(), support.getNodeQuorum());
                  // TODO: Halt system
                }
              } else if ( nodes.size() > next.getConsensusCount() ) {
                next.setConsensusCount(nodes.size());
                next.setConsensusNodes(nodes.entrySet().toArray());
              }
            }
            if ( entry == null ) {
              getLogger().warning("promoter", next, "no consensus", next.toSummary(), next.getConsensusCount(), support.getNodeQuorum());

            }
          }
          if ( entry == null ) {
            break;
          }
        }
      } catch ( Throwable e ) {
        getLogger().error("promoter", "execute", e.getMessage(), e);
        // TODO: Alarm
      } finally {
        // getLogger().debug("promoter", "execute", "exit");
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
      // getLogger().debug("mdao", entry.getIndex());

      try {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        if ( replaying.getReplaying() ||
             ! config.getIsPrimary() ) {
          String data = entry.getData();
          getLogger().debug("mdao", entry.getIndex(), entry.getDop().getLabel()); //, data);
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

        return entry;
      } catch (Throwable t) {
        getLogger().error(t);
        throw t;
        // TODO: Alarm
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
