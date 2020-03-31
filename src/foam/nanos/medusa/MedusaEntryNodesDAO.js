/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryNodesDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `If a new entry, forward to nodes`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
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
      MedusaEntry old = (MedusaEntry) getDelegate().find(entry.getId());
      if ( old == null ) {
        ((DAO) x.get("localNodesDAO")).put_(x, entry);
      }
      return getDelegate().put_(x, entry);
      `
    }
  ]
});
