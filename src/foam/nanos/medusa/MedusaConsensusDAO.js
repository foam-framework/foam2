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
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.HAS',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.GROUP_BY',
    'static foam.mlang.MLang.NEQ',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy',
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
      // REVIEW: potential memory leak. see promote/cleanup
      name: 'pending',
      class: 'Map',
      javaFactory: 'return new HashMap();',
      visibility: 'HIDDEN'
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
      try {
        MedusaEntry entry = (MedusaEntry) obj;
        if ( entry.getIndex() <= getIndex() ) {
          getLogger().debug("put", getIndex(), entry.getIndex(), entry.getNode(), "discarding");
          getPending().remove(entry.getIndex());
          return entry;
        }


        Long count = null;
        Object indexLock = Long.toString(entry.getIndex()).intern();
        synchronized ( indexLock ) {
          if ( entry.getIndex() <= getIndex() ) {
            getLogger().debug("put", getIndex(), entry.getIndex(), entry.getNode(), "discarding", "in-lock");
            getPending().remove(entry.getIndex());
            return entry;
          }

          getLogger().debug("put", getIndex(), entry.getIndex(), entry.getNode());
          entry = (MedusaEntry) getDelegate().put_(x, entry);

          count = (Long) getPending().get(entry.getIndex());
          if ( count == null ) {
            count = new Long(0L);
          }
          count += 1;
          getPending().put(entry.getIndex(), count);
        }

        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        count = (Long) getPending().get(entry.getIndex());
        if ( count != null &&
             count >= support.getNodeQuorum(x) ) {
          synchronized ( indexLock ) {
            if ( entry.getIndex() <= getIndex() ) {
              getLogger().debug("put", getIndex(), entry.getIndex(), entry.getNode(), "discarding", "in-lock(2)");
              getPending().remove(entry.getIndex());
              return entry;
            }
            MedusaEntry match = consensus(x, entry);
            if ( match.getHasConsensus() ) {
              getPending().remove(entry.getIndex());
            }
            return match;
          }
        }
        return entry;
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

      ReplayDetailsCmd cmd = (ReplayDetailsCmd) obj;
      getLogger().debug("cmd", cmd);
      synchronized ( replayLock_ ) {
        if ( cmd.getMaxIndex() > getReplayIndex() ) {
          setReplayIndex(cmd.getMaxIndex());
        }
        getReplayNodes().put(cmd.getResponder(), cmd);
      }

      // if no replay data, then replay complete.
      getLogger().debug("cmd", "replayNodes", getReplayNodes().size(), "node quorum", support.getNodeQuorum(x), "replayIndex", getReplayIndex(), "index", getIndex());
      if ( getReplayNodes().size() >= support.getNodeQuorum(x) &&
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

      DaggerService dagger = (DaggerService) x.get("daggerService");
      dagger.verify(x, entry);
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
        // synchronized ( promoteLock_ ) {
        //   getLogger().debug("promote", "notify");
        //   promoteLock_.notify();
        // }
      } else if ( getReplaying() ) {
        getLogger().debug("promote", "replay", getReplayIndex(), getReplaying());
      }

      getLogger().debug("promote", "cleanup", entry.getIndex());
      getDelegate().where(
        AND(
          EQ(MedusaEntry.INDEX, entry.getIndex()),
          NEQ(MedusaEntry.ID, entry.getId())
        ))
        .removeAll();
      getPending().remove(entry.getIndex());

      pm.log(x);
      return entry;
      `
    },
    {
      // REVIEW: optimize - most expensive method in medusa.
      documentation: 'Tally same index entries (one from each node) by hash. If a quorum of nodes have the same hash, then cleanup and return a match.',
      name: 'consensus',
      type: 'foam.nanos.medusa.MedusaEntry',
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
      javaCode: `
      PM pm = createPM(x, "getConsensusEntry");
      getLogger().debug("consensus", entry.getIndex());

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      String hash = null;
      long max = 0L;

      GroupBy groupBy = (GroupBy) getDelegate().where(
        EQ(MedusaEntry.INDEX, entry.getIndex())
      ).select(GROUP_BY(MedusaEntry.HASH, COUNT()));

      Map<String, Count> groups = groupBy.getGroups();
      for ( Map.Entry<String, Count> e : groups.entrySet() ) {
        if ( e.getValue().getValue() > max ) {
          max = e.getValue().getValue();
          hash = e.getKey();
        }
      }

      if ( max >= support.getNodeQuorum(x) ) {
        // TODO: consider reporting the split if groups > 1

        MedusaEntry match = null;
        if ( entry.getHash().equals(hash) ) {
          match = (MedusaEntry) entry.fclone();
        } else {
          List<MedusaEntry> list = (ArrayList) ((ArraySink) getDelegate().where(
            AND(
              EQ(MedusaEntry.INDEX, entry.getIndex()),
              EQ(MedusaEntry.HASH, hash)
            ))
            .limit(1)
            .select(new ArraySink())).getArray();

          match = (MedusaEntry) list.get(0).fclone();
        }
        match.setHasConsensus(true);
        match = (MedusaEntry) getDelegate().put_(x, match);
        getLogger().debug("consensus", getIndex(), match.getIndex(), match.getNode(), "consensus", true);
        if ( match.getIndex() == getIndex() + 1 ) {
          match =  promote(x, match);
        } else {
          getLogger().debug("consensus", getIndex(), match.getIndex(), match.getNode(), "promoteLock_.notify");
          synchronized ( promoteLock_ ) {
            promoteLock_.notify();
          }
          getLogger().debug("consensus", getIndex(), match.getIndex(), match.getNode(), "promoteLock_.notify", "return");
        }

        return match;
      } else {
        getLogger().debug("consensus", getIndex(), entry.getIndex(), entry.getNode(), "consensus", false);
      }
      pm.log(x);
      return entry;
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
      try {
        while ( true ) {
          List<MedusaEntry> list = ((ArraySink) getDelegate()
            .where(
              AND(
                EQ(MedusaEntry.INDEX, getIndex() + 1),
                EQ(MedusaEntry.HAS_CONSENSUS, true)
              ))
            .limit(1)
            .select(new ArraySink())).getArray();

          MedusaEntry entry = null;
          if ( list.size() > 0 ) {
            entry = list.get(0);
          }
          if ( entry != null &&
               entry.getHasConsensus() ) {
            promote(x, entry);
          } else {
            getLogger().debug("promoter", "lock", getIndex());
            synchronized ( promoteLock_ ) {
              getLogger().debug("promoter", "wait", getIndex());
              promoteLock_.wait();
              getLogger().debug("promoter", "wake", getIndex());
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
      DAO dao = (DAO) x.get("clusterConfigDAO");
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
