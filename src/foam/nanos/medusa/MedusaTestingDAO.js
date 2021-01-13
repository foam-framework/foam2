/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaTestingDAO',
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
      name: 'count',
      class: 'Long'
    },
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
try {
      MedusaEntry entry = (MedusaEntry) obj;
 
      long before = (Long) ((Count) getDelegate().select(COUNT())).getValue();
      if ( before < getCount() ) {
        getLogger().error("internal,reset,found", before, "expected", getCount());
      }
      getLogger().debug("put", "count", "internal", "before", before);
      getLogger().debug("put", "internal", entry.getIndex(), entry.getId(), entry);
      /*MedusaEntry*/ entry = (MedusaEntry) getDelegate().put_(x, obj);

      getLogger().debug("put", "count", "internal", "after", ((Count) getDelegate().select(COUNT())).getValue());

      foam.dao.DAO testing = (foam.dao.DAO) x.get("testingMedusaEntryDAO");
      getLogger().debug("put", "count", "testing", "before", ((Count) testing.select(COUNT())).getValue());
      getLogger().debug("put", "testing", entry.getIndex(), entry.getId());
      testing.put_(x, obj);
      long count = (Long) ((Count) testing.select(COUNT())).getValue();
      getLogger().debug("put", "count", "testing", "after", count);
      setCount(count);

      return entry;
} catch (Throwable t) {
  getLogger().error(t);
}
return null;
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
