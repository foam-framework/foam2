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
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.GROUP_BY',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
  ],

  properties: [
    {
      name: 'index',
      class: 'Long',
      visibilty: 'RO'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);
      `
    }
  ],

  methods: [
    {
  // TODO: this needs to be really fast.

      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      if ( entry.getIndex() < getIndex() ) {
        getLogger().debug("Discarding", entry);
        return entry;
      }

      entry = (MedusaEntry) getDelegate().put_(x, entry);

      MedusaEntry ce = getConsensusEntry(x, entry);
      if ( ce != null &&
           ce.getIndex() == getIndex() + 1 )  {
        getLogger().debug("consensus/promoting", ce.getIndex(), ce);
        setIndex(getIndex() + 1);
        DaggerService service = (DaggerService) x.get("daggerService");
        service.updateLinks(x, ce);
        return ce;
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

      // Tally by hash.
      List<MedusaEntry> arr = (ArrayList) ((ArraySink) getDelegate()
        .where(
          AND(
            EQ(MedusaEntry.INDEX, entry.getIndex())
          )
        )
        .select(new ArraySink())).getArray();

      Map<String, Long> counts = new HashMap();
      Long max = 0L;
      MedusaEntry match = null;
      for ( MedusaEntry e : arr ) {
        Long count = counts.get(e.getHash());
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
        for ( MedusaEntry e : arr ) {
          if ( e.getId() != match.getId() ) {
            getDelegate().remove_(x, e);
          } else {
            match = (MedusaEntry) match.fclone();
            match.setHasConsensus(true);
            match = (MedusaEntry) getDelegate().put_(x, match);
          }
        }
        return match;
      }
      return null;
      `
    }
  ]
});
