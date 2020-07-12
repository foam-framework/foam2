/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaUniqueDAO',
  extends: 'foam.dao.ProxyDAO',

  // REVIEW: this may only be occuring during development.
  documentation: `Enforce unique indexes on nodes`,

  javaImports: [
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  properties: [
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
      getLogger().debug("put", entry.getIndex());
      Count count = (Count) getDelegate().where(
        EQ(MedusaEntry.INDEX, entry.getIndex())
      ).select(COUNT());
      if ( count.getValue() > 0 ) {
        getLogger().error("put", "duplicate index", entry);
        throw new DaggerException("Duplicate index: "+entry.getIndex());
      }
      // ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      // entry.setNode(support.getConfigId());
      return getDelegate().put_(x, entry);
      `
    }
  ]
});
