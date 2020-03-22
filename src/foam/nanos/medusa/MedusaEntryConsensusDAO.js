/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryConsensusDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `On put test for quorum, and notify.`,

  javaImports: [
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
    'java.util.Map',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Random',
    'java.util.UUID'
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
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
  // Also need to select the obj from the winning hash.

      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) ((FObject)obj).fclone();
      // each copy from node needs a unique id.
      java.util.Random r = ThreadLocalRandom.current();
      entry.setId(new UUID(r.nextLong(), r.nextLong()).toString());
      entry = (MedusaEntry) ((DAO) x.get("localMedusaEntryDAO")).put_(x, obj);

      if ( hasConsensus(x, entry) ) {
        entry = (MedusaEntry) getDelegate().put_(x, entry);
        DaggerService service = (DaggerService) x.get("daggerService");
        service.updateLinks(x, entry);

        // TODO: remove all entries.
      }
      return entry;
      `
    },
    {
      name: 'hasConsensus',
      type: 'Boolean',
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
      GroupBy groupBy = (GroupBy) getDelegate().where(
        AND(
          EQ(MedusaEntry.MY_INDEX, entry.getMyIndex())
        )
      ).select(GROUP_BY(MedusaEntry.MY_HASH, COUNT()));

      String hash = null;;
      long max = 0;
      Map<String, Count> groups = groupBy.getGroups();
      for ( Map.Entry<String, Count> e : groups.entrySet() ) {
        if ( e.getValue().getValue() > max ) {
          hash = e.getKey();
          max = e.getValue().getValue();
        }
      }
      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      return (int) max >= service.getNodesForConsensus(x);
      `
    }
  ]
});
