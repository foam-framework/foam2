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
      value: 2, /*MedusaEntryConsensusDAO.INITIAL_INDEX_OFFSET,*/
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
      MedusaEntry entry = (MedusaEntry) obj;
      getLogger().debug("put", getIndex(), entry.getIndex());

// TODO: move do own dao
      // DaggerService service = (DaggerService) x.get("daggerService");
      // if ( entry.getIndex() > service.getGlobalIndex(x) ) {
      //   service.setGlobalIndex(x, entry.getIndex());
      //   getLogger().debug("put", getIndex(), "setGlobalIndex", entry.getIndex());
      //   getLogger().error("put", "index > globalIndex", getIndex(), service.getGlobalIndex(x));
      //   // TODO: now what?
      // }

      MedusaEntry ce = null;
      synchronized ( Long.toString(entry.getIndex()).intern() ) {

        if ( entry.getIndex() <= getIndex() ) {
          getLogger().info("put", getIndex(), "discarding", entry.getIndex());
          return entry;
        }

        MedusaEntry me = (MedusaEntry) getDelegate().put_(x, entry);

        ce = getConsensusEntry(x, me);
        if ( ce != null &&
             ce.getIndex() == getIndex() + 1 ) {
          ce =  promote(x, ce);
          return ce;
        }
      } // release lock

      if ( ce != null &&
           ce.getIndex() > getIndex() ) {
        getLogger().debug("put", "promoteLock_.notify", getIndex(), ce.getIndex());
        synchronized ( promoteLock_ ) {
          promoteLock_.notify();
        }
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
          DaggerService dagger = (DaggerService) x.get("daggerService");
          dagger.setGlobalIndex(x, cmd.getMaxIndex());
          getLogger().debug("cmd", "update", "globlalIndex", cmd.getMaxIndex(), dagger.getGlobalIndex(x));
        }
        getReplayNodes().put(cmd.getResponder(), cmd);
      }

      // if no replay data, then replay complete.
      getLogger().debug("cmd", "replayNodes", getReplayNodes().size(), "node quorum", service.getNodeQuorum(x), "replayIndex", getReplayIndex());
      if ( getReplayNodes().size() >= service.getNodeQuorum(x) &&
           getReplayIndex() == 2L /*MedusaEntryConsensusDAO.INITIAL_INDEX_OFFSET*/ ) {
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
      DaggerService dagger = (DaggerService) x.get("daggerService");
      dagger.verify(x, entry);
      getLogger().info("promote", getIndex(), entry.getIndex());
      synchronized ( indexLock_ ) {
        if ( entry.getIndex() == getIndex() + 1 ) {
          setIndex(entry.getIndex());
        }
      }

      dagger.updateLinks(x, entry);

      if ( getReplaying() &&
         getIndex() >= getReplayIndex() ) { //+ 2 /*MedusaEntryConsensusDAO.INITIAL_INDEX_OFFSET*/) {
        getLogger().debug("promote", "replayComplete");
        replayComplete(x);
        synchronized ( promoteLock_ ) {
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
      MedusaEntry match = null;
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

      if ( max >= (service.getNodeCount(x) / 2 + 1) ) {
        // TODO: consider reporting the split if max
        // does not equal number of nodes.

        List<MedusaEntry> list = (ArrayList) ((ArraySink) getDelegate().where(
          EQ(MedusaEntry.INDEX, entry.getIndex())
        ).select(new ArraySink())).getArray();
        for ( MedusaEntry e : list ) {
          if ( match == null &&
               e.getHash().equals(hash) ) {
            match = (MedusaEntry) e.fclone();
            match.setHasConsensus(true);
            match = (MedusaEntry) getDelegate().put_(x, match);
            getLogger().debug("match", match.getIndex());
          }
        }
        if ( match != null ) {
          getLogger().debug("cleanup", entry.getIndex());
          getDelegate().where(
            AND(
              EQ(MedusaEntry.INDEX, entry.getIndex()),
              NEQ(MedusaEntry.ID, match.getId())
            )
          ).removeAll();
        }
      }
      return match;
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
          MedusaEntry entry = (MedusaEntry) getDelegate().find_(x, getIndex() + 1);
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
      ((DAO) x.get("localMedusaEntryDAO")).cmd(new ReplayCompleteCmd());
      ((ClusterConfigService) x.get("clusterConfigService")).setOnline(x, true);
      `
    }
  ]
});
