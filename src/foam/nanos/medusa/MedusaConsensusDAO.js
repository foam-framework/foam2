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
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.MAX',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Max',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.util.Arrays',
    'java.util.ArrayList',
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
  protected Object promoterLock_ = new Object();
          `
        }));
      }
    }
  ],

  properties: [
    {
      name: 'timerInterval',
      class: 'Long',
      value: 10000
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      value: 30000
    },
    {
      name: 'lastPromotedIndex',
      class: 'Long'
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
      MedusaEntry entry = (MedusaEntry) obj;
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      getLogger().debug("put", replaying.getIndex(), replaying.getReplayIndex(), entry.toSummary(), "from", entry.getNode());
      PM pm = null;
      try {
        if ( replaying.getIndex() > entry.getIndex() ) {
          getLogger().info("put", replaying.getIndex(), entry.toSummary(), "from", entry.getNode(), "discarding");
          return entry;
        }
        MedusaEntry existing = (MedusaEntry) getDelegate().find_(x, entry.getId());
        if ( existing != null &&
             existing.getPromoted() ) {
          // getLogger().debug("put", replaying.getIndex(), entry.toSummary(), "from", entry.getNode(), "discarding");
          return existing;
        }

        synchronized ( entry.getId().toString().intern() ) {
          if ( replaying.getIndex() > entry.getIndex() ) {
            getLogger().debug("put", replaying.getIndex(), entry.toSummary(), "from", entry.getNode(), "discarding", "in-lock");
            return entry;
          }
          existing = (MedusaEntry) getDelegate().find_(x, entry.getId());
          if ( existing != null ) {
            if ( existing.getPromoted() ) {
              // getLogger().debug("put", replaying.getIndex(), entry.toSummary(), "from", entry.getNode(), "discarding", "in-lock");
              return existing;
            }
            // getLogger().debug("put", entry.toSummary(), "from", entry.getNode(), "existing");
          } else {
             existing = entry;
          }
          pm = PM.create(x, this.getClass().getSimpleName(), "put");

          // NOTE: all this business with the nested Maps to avoid
          // a mulitipart id (index,hash) on MedusaEntry, as presently
          // it is a huge performance impact.
          Map<String, Map> hashes = existing.getConsensusHashes();
          Map<String, Object> nodes = hashes.get(entry.getHash());
          if ( nodes == null ) {
            nodes = new HashMap<String, Object>();
            hashes.put(entry.getHash(), nodes);
          }
          if ( nodes.get(entry.getNode()) == null ) {
            nodes.put(entry.getNode(), entry);
          }

          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
          if ( nodes.size() >= support.getNodeQuorum() &&
               entry.getIndex() == replaying.getIndex() + 1 ) {
            if ( entry.isFrozen() ) {
              entry = (MedusaEntry) entry.fclone();
            }
            entry.setConsensusCount(nodes.size());
            entry.setConsensusNodes(nodes.keySet().toArray(new String[0]));
            entry = (MedusaEntry) getDelegate().put_(x, entry);
            entry = promote(x, entry);
          } else {
            if ( existing.isFrozen() ) {
              existing = (MedusaEntry) existing.fclone();
            }
            existing.setConsensusHashes(hashes);
            if ( nodes.size() > existing.getConsensusCount() ) {
              existing.setConsensusCount(nodes.size());
              existing.setConsensusNodes(nodes.keySet().toArray(new String[0]));
            }
            existing = (MedusaEntry) getDelegate().put_(x, existing);
          }
        }

       if ( ! entry.getPromoted() ) {
          synchronized ( promoterLock_ ) {
            promoterLock_.notify();
          }
        }
        return entry;
      } finally {
        if ( pm != null ) pm.log(x);
      }
      `
    },
    {
      documentation: `Make an entry available for Dagger hashing.`,
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
      // NOTE: implementation expects caller to lock on entry index
      // getLogger().debug("promote", entry.getId());
      PM pm = PM.create(x, this.getClass().getSimpleName(), "promote");
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      DaggerService dagger = (DaggerService) x.get("daggerService");
      try {
        entry = (MedusaEntry) getDelegate().find_(x, entry.getId());
        if ( entry.getPromoted() ) {
          return entry;
        }
        if ( entry.isFrozen() ) {
          entry = (MedusaEntry) entry.fclone();
        }

        // REVIEW: partial cleanup.
        MedusaEntry.CONSENSUS_HASHES.clear(entry);

        dagger.verify(x, entry);
        dagger.updateLinks(x, entry);
        // test to save a synchronized call
        if ( entry.getIndex() > dagger.getGlobalIndex(x) ) {
          // Required on Secondaries.
          dagger.setGlobalIndex(x, entry.getIndex());
        }

        entry.setPromoted(true);
        entry = (MedusaEntry) getDelegate().put_(x, entry);

        entry = mdao(x, entry);

        // Notify any blocked Primary puts
        MedusaRegistry registry = (MedusaRegistry) x.get("medusaRegistry");
        registry.notify(x, entry);

        replaying.updateIndex(x, entry.getIndex());
        replaying.setNonConsensusIndex(0);
        replaying.setLastModified(new java.util.Date());
        if ( replaying.getReplaying() &&
             replaying.getIndex() >= replaying.getReplayIndex() ) {
          getLogger().info("promote", "replayComplete", replaying.getIndex());
          ((DAO) x.get("localMedusaEntryDAO")).cmd(new ReplayCompleteCmd());
        }

        // TODO: additional cleanup
        //MedusaEntry.DATA.clear(entry);
        //entry = (MedusaEntry) getDelegate().put_(x, entry);
        //getDelegate().remove_(x, entry);
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
      getLogger().info("start");
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      Timer timer = new Timer(this.getClass().getSimpleName());
      timer.schedule(
        new AgencyTimerTask(getX(), support.getThreadPoolName(), this),
        getInitialTimerDelay());
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
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      try {
        while ( true ) {
          ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
          PM pm = PM.create(x, "MedusaConsensusDAO", "promoter");
          MedusaEntry entry = null;
          try {
            Long nextIndex = replaying.getIndex() + 1;
            getLogger().debug("promoter", "next", nextIndex);
            MedusaEntry next = (MedusaEntry) getDelegate().find_(x, nextIndex);
            if ( next != null ) {
              synchronized ( next.getId().toString().intern() ) {
                if ( next.getPromoted() ) {
                  continue;
                }
                Map<Object, Map> hashes = next.getConsensusHashes();
                for ( Map<String, MedusaEntry> nodes : hashes.values() ) {
                  if ( nodes.size() >= support.getNodeQuorum() ) {
                    if ( entry == null ) {
                      for ( MedusaEntry e : nodes.values() ) {
                        entry = e;
                        break;
                      }
                      entry = promote(x, entry);
                    } else {
                      getLogger().error("promoter", next, "Multiple consensus detected", next.toSummary(), next.getConsensusCount(), support.getNodeQuorum());
                      throw new RuntimeException("Multiple consensus detected. "+next.toSummary());
                    }
                  }
                }
              }

              if ( entry == null ) {
                if ( replaying.getNonConsensusIndex() < nextIndex ) {
                  replaying.setNonConsensusIndex(nextIndex);
                  replaying.setLastModified(new java.util.Date());
                }
                // TODO: alarming configuration.
                if ( replaying.getReplaying() ) {
                  if ( System.currentTimeMillis() - replaying.getLastModified().getTime() > 60000 ) {
                    getLogger().warning("promoter", "no consensus", next.getConsensusCount(), support.getNodeQuorum(), "since", replaying.getLastModified(), "on", next.toSummary());
                  }
                } else if ( System.currentTimeMillis() - replaying.getLastModified().getTime() > 5000 ) {
                  getLogger().warning("promoter", "no consensus", next.getConsensusCount(), support.getNodeQuorum(), "since", replaying.getLastModified(), "on", next.toSummary());
                }
              }
            }
          } finally {
            pm.log(x);
          }
          if ( entry == null ) {
            try {
              synchronized ( promoterLock_ ) {
                promoterLock_.wait(getTimerInterval());
              }
            } catch (InterruptedException e ) {
              break;
            }
          }
        }
      } catch ( Throwable e ) {
        getLogger().error("promoter", e.getMessage(), e);
        DAO d = (DAO) x.get("localClusterConfigDAO");
        ClusterConfig config = (ClusterConfig) d.find(support.getConfigId()).fclone();
        config.setErrorMessage(e.getMessage());
        config.setStatus(Status.OFFLINE);
        d.put(config);
        // TODO: Alarm
      } finally {
        getLogger().warning("promoter", "exit");
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
      PM pm = PM.create(x, this.getClass().getSimpleName(), "mdao");
      // getLogger().debug("mdao", entry.getIndex());

      try {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        if ( replaying.getReplaying() ||
             ! config.getIsPrimary() ) {
          String data = entry.getData();
          // getLogger().debug("mdao", entry.getIndex(), entry.getDop().getLabel()); //, data);
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
        pm.error(x, t);
        getLogger().error(t);
        throw t;
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
