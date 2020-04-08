/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryTestingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Test for index -1 entries`,
  
  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'foam.mlang.sink.Count',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],
  
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    },
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) getDelegate().put_(x, obj);
      getLogger().debug("put", entry.getIndex(), entry.getId());

      Count count = (Count) getDelegate()
      .where(
        OR(
          EQ(MedusaEntry.INDEX1, -1L),
          EQ(MedusaEntry.INDEX2, -1L)
        ))
      .select(COUNT());
      getLogger().debug("put", "index -1 count", count.getValue());

      // .select(new foam.dao.Sink() {
      //   public void put(Object obj, foam.core.Detachable sub) {
      //     getLogger().debug("select", obj);
      //   }

      //   public void remove(Object obj, foam.core.Detachable sub) {
      //     // nop
      //   }

      //   public void eof() {
      //     // nop
      //   }

      //   public void reset(foam.core.Detachable sub) {
      //     // nop
      //   }
      // });

      return entry;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) getDelegate().remove_(x, obj);
      getLogger().debug("remove", entry.getId(), entry.getIndex());
      return entry;
    `
    }
  ]
});
