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

  documentation: `On put test for consensus, cleanup, and notify.`,

  javaImports: [
    'foam.core.Agency',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy',
    'foam.mlang.sink.Sequence',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.HAS',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.GROUP_BY',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.concurrent.atomic.AtomicLong',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  // NOTE: HACK: starting at 2, as indexes 1 and 2 are used to prime the system.
  // REVIEW: needed?
  private volatile AtomicLong localIndex_ = new AtomicLong(2);
  private Object promoteLock_ = new Object();
          `
        }));
      }
    }
  ],

  properties: [
    {
      name: 'index',
      class: 'Long',
      visibilty: 'RO',
      javaGetter: `return localIndex_.longValue();`
    },
    {
      name: 'threadPoolName',
      class: 'String',
      value: 'threadPool'
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
      getLogger().debug("put", getIndex(), entry.getIndex(), entry.getHasConsensus());

      DaggerService service = (DaggerService) x.get("daggerService");
      if ( entry.getIndex() > service.getGlobalIndex(x) ) {
        service.setGlobalIndex(x, entry.getIndex());
        getLogger().debug("put", getIndex(), "setGlobalIndex", entry.getIndex());
      }


      if ( entry.getIndex() <= getIndex() ) {
        getLogger().warning("put", getIndex(), "discarding", entry.getIndex());
        return entry;
      }

      // REVIEW: synchronization/locking
      MedusaEntry ce = null;
      synchronized ( Long.toString(entry.getIndex()).intern() ) {
        MedusaEntry me = (MedusaEntry) getDelegate().put_(x, entry);

        ce = getConsensusEntry(x, me);
      }
      if ( ce != null &&
           ce.getHasConsensus() ) {
        if ( ce.getIndex() == getIndex() + 1 ) {
          return promote(x, ce);
        }
        if ( ce.getIndex() > getIndex() + 1 ) {
          getLogger().debug("put", getIndex(), "notify");
          synchronized ( promoteLock_ ) {
            promoteLock_.notify();
          }
        }
      }
      return entry;
      `
    },
    {
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
      DaggerService service = (DaggerService) x.get("daggerService");
      service.verify(x, entry);
      getLogger().info("promote", getIndex(), entry.getIndex());
      setIndex(localIndex_.getAndIncrement());
      service.updateLinks(x, entry);
      return entry;
      `
    },
    {
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
      // Tally by hash.
      getLogger().debug("getConsensus", entry.getIndex());

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

      if ( max >= service.getNodesForConsensus(x) ) {
        // TODO: consider reporting the split if max
        // does not equal number of nodes.

        List<MedusaEntry> list = (ArrayList) ((ArraySink) getDelegate().where(
          EQ(MedusaEntry.INDEX, entry.getIndex())
        ).select(new ArraySink())).getArray();
        getLogger().debug("match");
        for ( MedusaEntry e : list ) {
          if ( match == null &&
               e.getHash().equals(hash) ) {
            match = (MedusaEntry) e.fclone();
            match.setHasConsensus(true);
            match = (MedusaEntry) getDelegate().put_(x, match);
          }
        }
        if ( match != null ) {
          getLogger().debug("cleanup");
          getDelegate().where(
            EQ(MedusaEntry.INDEX, entry.getIndex())
          ).removeAll();
        }
      }
      return match;
      `
    },
    {
      name: 'start',
      javaCode: `
      getLogger().debug("start");
      ((Agency) getX().get(getThreadPoolName())).submit(getX(), this, "Consensus Promotion");
      `
    },
    {
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
        while (true) {
          MedusaEntry entry = (MedusaEntry) getDelegate().find_(x, getIndex() + 1);
          if ( entry != null &&
               entry.getHasConsensus() ) {
            promote(x, entry);
          } else {
            getLogger().debug("execute", "wait");
            synchronized ( promoteLock_ ) {
              promoteLock_.wait();
            }
            getLogger().debug("execute", "wake");
          }
        }
      } catch ( InterruptedException e ) {
        // nop
      } catch ( Exception e ) {
        getLogger().error("execute", e.getMessage(), e);
        // TODO: Alarm
      }
     `
    }
  ]
});
