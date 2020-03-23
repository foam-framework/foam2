/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryIdDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Explicitly set ID, so all copies from nodes are unique`,

  javaImports: [
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Random',
    'java.util.UUID'
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
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      if ( entry.isFrozen() ) {
        entry = (MedusaEntry) entry.fclone();
      }

      java.util.Random r = ThreadLocalRandom.current();
      // each copy from node needs a unique id.
      entry.setId(new UUID(r.nextLong(), r.nextLong()).toString());
      return (MedusaEntry) getDelegate().put_(x, entry);
      `
    }
  ]
});
