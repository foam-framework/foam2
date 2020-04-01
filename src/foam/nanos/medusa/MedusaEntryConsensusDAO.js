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
    'java.util.List',
    'java.util.Map'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  private Object indexLock_ = new Object();
  private Object promoteLock_ = new Object();
          `
        }));
      }
    }
  ],

  properties: [
    {
      // NOTE: starting at 2 as indexes 1 and 2 are used to prime the system.
      name: 'index',
      class: 'Long',
      value: 2,
      visibilty: 'RO',
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

      DaggerService service = (DaggerService) x.get("daggerService");
      if ( entry.getIndex() > service.getGlobalIndex(x) ) {
        service.setGlobalIndex(x, entry.getIndex());
        getLogger().debug("put", getIndex(), "setGlobalIndex", entry.getIndex());
      }

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
        }
      }

      if ( ce != null ) {
        if ( service.getGlobalIndex(x) > getIndex() ) {
          getLogger().debug("put", "lock", getIndex(), entry.getIndex());
          synchronized ( promoteLock_ ) {
            getLogger().debug("put", "notify", getIndex(), entry.getIndex());
            promoteLock_.notify();
          }
        }
        return ce;
      }
      return entry;
      `
    },
    {
      documentation: 'Make an entry available for Dagger hasing.',
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
      synchronized ( indexLock_ ) {
        if ( entry.getIndex() == getIndex() + 1 ) {
          setIndex(entry.getIndex());
        }
      }
      service.updateLinks(x, entry);
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
            AND(
              EQ(MedusaEntry.INDEX, entry.getIndex()),
              NEQ(MedusaEntry.INDEX, match.getIndex())
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
    }
  ]
});
