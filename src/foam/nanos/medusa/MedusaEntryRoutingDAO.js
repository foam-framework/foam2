/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryRoutingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Consensus has been reached for an object, put it into it's MDAO. Also generate a notification to wake any blocked Primary puts.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.EasyDAO',
    'foam.dao.MDAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.Map',
    'java.util.HashMap',
  ],

  properties: [
    {
      name: 'mdaos',
      class: 'Map',
      javaFactory: 'return new HashMap();',
      visibility: 'HIDDEN'
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
      MedusaEntry entry = (MedusaEntry) getDelegate().put_(x, obj);
      if ( ! entry.getHasConsensus() ) {
        getLogger().debug("put", entry.getIndex(), "consensus", false);
        return entry;
      }
      getLogger().debug("put", entry.getIndex(), "consensus", "TRUE");

      try {
        DAO mdao = getMdao(x, entry);
        if ( MedusaEntry.PUT.equals(entry.getAction()) ) {
          getLogger().debug("put", entry.getIndex(), "mdao", "put");
          mdao.put_(x, entry.getData());
        } else {
          getLogger().debug("put", entry.getIndex(), "mdao", "remove");
          mdao.remove_(x, entry.getData());
        }

        // Notify any blocked Primary puts
        getLogger().debug("put", entry.getIndex(), "notify");
        ((DAO) x.get("localMedusaEntryDAO")).cmd_(x, entry);
        getLogger().debug("put", entry.getIndex(), "notified");

      } catch (Throwable t) {
        getLogger().error(t);
        // TODO: Alarm
      }
      return entry;
      `
    },
    {
      name: 'getMdao',
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
      type: 'foam.dao.DAO',
      javaCode: `
      String name = entry.getNSpecName();
      getLogger().debug("mdao", name);
      DAO dao = (DAO) getMdaos().get(name);
      if ( dao != null ) {
        getLogger().debug("mdao", name, "cache", dao.getOf());
        return dao;
      } 
      dao = (DAO) x.get(name);
      Object result = dao.cmd(MDAO.GET_MDAO_CMD);
      if ( result != null &&
           result instanceof MDAO ) {
        getLogger().debug("mdao", name, "cmd", dao.getOf());
        dao = (DAO) result;
      } else {
        while ( dao != null ) {
          getLogger().debug("mdao", name, "while", dao.getOf());
          if ( dao instanceof MDAO ) {
            break;
          }
          if ( dao instanceof EasyDAO ) {
            dao = ((EasyDAO) dao).getMdao();
            if ( dao != null ) {
              break;
            }
          }
          if ( dao instanceof ProxyDAO ) {
            dao = ((ProxyDAO) dao).getDelegate();
          } else {
            dao = null;
          }
        }
      }
      if ( dao != null ) {
        getMdaos().put(name, dao);
        getLogger().debug("mdao", name, "found", dao.getOf());
        return dao;
      }
      throw new IllegalArgumentException("MDAO not found: "+name); 
      `
    }
  ]
});
