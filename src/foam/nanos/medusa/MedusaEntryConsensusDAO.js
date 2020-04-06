/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryConsensusDAO',
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
      name: 'INITIAL_INDEX_OFFSET',
      class: 'Long',
      value: 2
    }
  ],

  properties: [
    {
      // NOTE: starting at 2 as indexes 1 and 2 are used to prime the system.
      name: 'index',
      class: 'Long',
      value: 2, /*DaggerService.INITIAL_INDEX_OFFSET,*/
      visibilty: 'RO',
    },
    {
      // NOTE: starting at 2 as indexes 1 and 2 are used to prime the system.
      name: 'replayIndex',
      class: 'Long',
      value: 2, /*MedusaEntryConsensusDAO.INITIAL_INDEX_OFFSET,*/
      visibilty: 'RO',
    },
    {
      name: 'replaying',
      class: 'Boolean',
      value: true,
      visibilty: 'RO',
    },
    {
      name: 'replayNodes',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'threadPoolName',
      class: 'String',
      value: 'medusaThreadPool'
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
      // TODO: this needs to be really fast.
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) getDelegate().put_(x, obj);
      getLogger().debug("put", getIndex(), entry.getIndex(), entry.getNode());
      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");

      if ( entry.getIndex() <= getIndex() ) {
        getLogger().info("put", "pre-lock", getIndex(), entry.getIndex(), entry.getNode(), "discarding");
        return entry;
      }

      Count count = (Count) getDelegate().where(
        EQ(MedusaEntry.INDEX, entry.getIndex())
      ).select(COUNT());
      if ( (Long)count.getValue() < service.getNodeQuorum(x) ) {
        getLogger().info("put", getIndex(), entry.getIndex(), entry.getNode(), "waiting for node quorum");
        return entry;
      }

      MedusaEntry ce = null;
      synchronized ( Long.toString(entry.getIndex()).intern() ) {
        if ( entry.getIndex() <= getIndex() ) {
          getLogger().info("put", "in-lock", getIndex(), entry.getIndex(), entry.getNode(), "discarding");
          return entry;
        }

        ce = getConsensusEntry(x, entry);
        getLogger().debug("put", getIndex(), ce.getIndex(), ce.getNode(), "consensus", ce.getHasConsensus());
        if ( ce != null &&
             ce.getHasConsensus() &&
             ce.getIndex() == getIndex() + 1 ) {
          ce =  promote(x, ce);
          return ce;
        }
      }

      if ( ce != null &&
           ce.getHasConsensus() &&
           ce.getIndex() > getIndex() ) {
        getLogger().debug("put", getIndex(), ce.getIndex(), ce.getNode(), "promoteLock_.notify");
        synchronized ( promoteLock_ ) {
          promoteLock_.notify();
        }
        getLogger().debug("put", getIndex(), ce.getIndex(), ce.getNode(), "promoteLock_.notify", "return");
        return ce;
      }

      return entry;
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( ! ( obj instanceof ReplayDetailsCmd ) ) {
        return getDelegate().cmd_(x, obj);
      }

      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");

      ReplayDetailsCmd cmd = (ReplayDetailsCmd) obj;
      getLogger().debug("cmd", cmd);
      synchronized ( replayLock_ ) {
        if ( cmd.getMaxIndex() > getReplayIndex() ) {
          setReplayIndex(cmd.getMaxIndex());
        }
        getReplayNodes().put(cmd.getResponder(), cmd);
      }

      // if no replay data, then replay complete.
      getLogger().debug("cmd", "replayNodes", getReplayNodes().size(), "node quorum", service.getNodeQuorum(x), "replayIndex", getReplayIndex(), "index", getIndex());
      if ( getReplayNodes().size() >= service.getNodeQuorum(x) &&
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
      getLogger().info("promote", getIndex(), entry.getIndex());

      DaggerService dagger = (DaggerService) x.get("daggerService");
      dagger.verify(x, entry);
      synchronized ( indexLock_ ) {
        if ( entry.getIndex() == getIndex() + 1 ) {
          setIndex(entry.getIndex());
        }
      }

      dagger.updateLinks(x, entry);

      getLogger().debug("promote", getIndex(), entry.getIndex());
      if ( getReplaying() ) {
        getLogger().debug("promote", "replay", getReplayIndex(), getReplaying());
      }
      if ( getReplaying() &&
         getIndex() >= getReplayIndex() ) {
        getLogger().debug("promote", "replayComplete");
        replayComplete(x);
        synchronized ( promoteLock_ ) {
          getLogger().debug("promote", "notify");
          promoteLock_.notify();
        }
      }

      return entry;
      `
    },
    {
      documentation: 'Tally same index entries (one from each node) by hash. If a quorum of nodes have the same hash, then cleanup and return a match.',
      name: 'getConsensusEntry',
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
      getLogger().debug("consensus", entry.getIndex());

      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
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

      if ( max >= service.getNodeQuorum(x) ) {
        // TODO: consider reporting the split if groups > 1

        List<MedusaEntry> list = (ArrayList) ((ArraySink) getDelegate().where(
          AND(
            EQ(MedusaEntry.INDEX, entry.getIndex()),
            EQ(MedusaEntry.HASH, hash)
          ))
          .limit(1)
          .select(new ArraySink())).getArray();

        MedusaEntry match = (MedusaEntry) list.get(0).fclone();
        match.setHasConsensus(true);
        getLogger().debug("match", match.getIndex());
        match = (MedusaEntry) getDelegate().put_(x, match);

        getLogger().debug("cleanup", entry.getIndex());
        getDelegate().where(
          AND(
            EQ(MedusaEntry.INDEX, entry.getIndex()),
            NEQ(MedusaEntry.ID, match.getId())
          ))
          .removeAll();

        return match;
      }
      return entry;
      `
    },
    {
      documentation: 'NanoService implementation.',
      name: 'start',
      javaCode: `
      getLogger().debug("start");
      ((Agency) getX().get(getThreadPoolName())).submit(getX(), this, "Consensus Promoter");
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
            .where(EQ(MedusaEntry.INDEX, getIndex() + 1))
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
      getLogger().debug("replayComplete");
      setReplaying(false);
      ((ClusterConfigService) x.get("clusterConfigService")).setOnline(x, true);
      ((DAO) x.get("localMedusaEntryDAO")).cmd(new ReplayCompleteCmd());
      `
    }
  ]
});
