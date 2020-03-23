/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryRoutingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Route real put to mdao, and cmd to context dao.`,

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
      DAO mdao = getMdao(x, entry);
      if ( "p".equals(entry.getAction()) ) {
        mdao.put_(x, entry.getNu());
      } else {
        mdao.remove_(x, entry.getNu());
      }

      // Notify any blocked Primary puts
      String name = entry.getNspecKey();
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
      String name = entry.getNspecKey();
      DAO mdao = (DAO) getMdaos().get(name);
      if ( mdao != null ) {
        return mdao;
      } 
      DAO dao = (DAO) x.get(name);
      while ( dao != null ) {
        if ( dao instanceof MDAO ) {
          getMdaos().put(name, mdao);
          return mdao;
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
