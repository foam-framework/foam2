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
      javaFactory: 'return new HashMap();'
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
        return entry;
      }

      DAO mdao = getMdao(x, entry);
      if ( "p".equals(entry.getAction()) ) {
        mdao.put_(x, entry.getData());
      } else {
        mdao.remove_(x, entry.getData());
      }

      // Notify any blocked Primary puts
      String name = entry.getNSpecName();
      ((DAO) x.get(name)).cmd_(x, entry);

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
      DAO mdao = (DAO) getMdaos().get(name);
      if ( mdao != null ) {
        return mdao;
      } 
      DAO dao = (DAO) x.get(name);
      while ( dao != null ) {
        if ( dao instanceof MDAO ) {
          getMdaos().put(name, dao);
          return dao;
        }
        if ( dao instanceof ProxyDAO ) {
          dao = ((ProxyDAO) dao).getDelegate();
        } else {
          break;
        }
      }
      throw new IllegalArgumentException("MDAO not found: "+name); 
      `
    }
  ]
});
