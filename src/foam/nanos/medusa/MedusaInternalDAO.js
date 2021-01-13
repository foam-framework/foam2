/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaInternalDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Manage access to internal MedusaEntry DAO.
Presently we have data loss when both the local and non-local MedusaEntry
DAO stacks both end at x.get("internalMedusaEntryDAO").
Update: it appears there are multiple DAOs in the context.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
  ],

  properties: [
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      javaFactory: `
      DAO dao = (DAO) getX().get("internalMedusaDAO");
      setDelegate(dao);
      return dao;
      `
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
      name: 'find_',
      javaCode: `
      // getLogger().debug("find");
      return getDao().find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
      // getLogger().debug("select");
      return getDao().select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'put_',
      javaCode: `
      // getLogger().debug("put");
      return getDelegate().put_(x, getDao().put_(x, obj));
      `
    }
  ]
});
