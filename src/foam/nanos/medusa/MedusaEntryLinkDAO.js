/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryLinkDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Add Id and Dagger link values to the MedusaEntry`,

  javaImports: [
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Random',
    'java.util.UUID'
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
      documentation: 'set Id, and link with parent indexes and hashes.',
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      DaggerService dagger = (DaggerService) x.get("daggerService");
      getLogger().debug("put", entry.getIndex(), "before", "global", dagger.getGlobalIndex(x));
      java.util.Random r = ThreadLocalRandom.current();
      entry.setId(new UUID(r.nextLong(), r.nextLong()).toString());
      entry = dagger.link(x, entry);
      getLogger().debug("put", entry.getIndex(), "after", "global", dagger.getGlobalIndex(x));
      return getDelegate().put_(x, entry);
      `
    }
  ]
});
