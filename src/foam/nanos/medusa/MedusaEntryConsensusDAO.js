/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryConsensusDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `On put test for consensus, cleanup, and notify.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy',
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
  private volatile AtomicLong localIndex_ = new AtomicLong(2);
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
      getLogger().debug("put", getIndex(), entry);

      // REVIEW: multiple nodes will be responding symultanously.
      synchronized ( Long.toString(entry.getIndex()).intern() ) {

      if ( entry.getIndex() <= getIndex() ) {
        getLogger().debug("put", "discarding", entry);
        return entry;
      }

      entry = (MedusaEntry) getDelegate().put_(x, entry);

      MedusaEntry ce = getConsensusEntry(x, entry);
      getLogger().debug("put", "index", getIndex(), "ce", entry);
      if ( ce != null &&
           ce.getIndex() == getIndex() + 1 )  {
        DaggerService service = (DaggerService) x.get("daggerService");
        service.verify(x, ce);
        getLogger().debug("promoting", ce.getIndex(), ce);
        setIndex(localIndex_.getAndIncrement());
        service.updateLinks(x, ce);
        return ce;
      }
      }
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
      List<MedusaEntry> arr = (ArrayList) ((ArraySink) getDelegate()
        .where(
          AND(
            EQ(MedusaEntry.INDEX, entry.getIndex()) //,
            // HAS(MedusaEntry.HASH)
          )
        )
        .select(new ArraySink())).getArray();

      Map<String, Long> counts = new HashMap();
      Long max = 0L;
      MedusaEntry match = null;
      for ( MedusaEntry e : arr ) {
        if ( SafetyUtil.isEmpty(e.getHash()) ) {
          continue;
        }
        Long count = counts.get(e.getHash());
        if ( count == null ) {
          count = Long.valueOf(0L);
        }
        count += 1;
        counts.put(e.getHash(), count);
        if ( count >= max ) {
          max = count;
          match = e;
        }
      }

      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      if ( max >= service.getNodesForConsensus(x) ) {
        // Remove all but one entry for index.
        getLogger().debug("cleanup");
        for ( MedusaEntry e : arr ) {
          if ( e.getId().equals(match.getId()) ) {
            match = (MedusaEntry) match.fclone();
            match.setHasConsensus(true);
            match = (MedusaEntry) getDelegate().put_(x, match);
          } else {
            getDelegate().remove_(x, e);
          }
        }
        return match;
      }
      return null;

      // Alternate approches
      // perform count, if >= nodes, then select again and test hashes.

      // String hash = null;
      // long max = 0L;
      // MedusaEntry me = null;
      // GroupBy groupBy = (GroupBy) getDelegate().where(
      //   AND(
      //     EQ(MedusaEntry.INDEX, entry.getIndex())
      //   )
      // ).select(GROUP_BY(MedusaEntry.HASH, COUNT()));

      // Map<String, Count> groups = groupBy.getGroups();
      // for ( Map.Entry<String, Count> e : groups.entrySet() ) {
      //   if ( e.getValue().getValue() > max ) {
      //     hash = e.getKey();
      //     max = e.getValue().getValue();
      //     me = e;
      //   }
      // }
      `
    }
  ]
});
