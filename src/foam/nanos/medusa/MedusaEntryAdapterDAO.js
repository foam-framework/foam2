/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryAdapterDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.nanos.boot.NSpecAware',
  ],

  documentation: `Create a medusa entry for argument model. NOTE:  delegate is parent MDAO, but only used as holder for MedusaEntryRoutingDAO to find.`,

  javaImports: [
    'foam.core.FObject',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      of: 'foam.nanos.boot.NSpec'
    },
    {
      name: 'medusaEntryDAO',
      class: 'FObjectProperty',
      of: 'foam.dao.DAO',
      javaFactory: 'return (foam.dao.DAO) getX().get("localMedusaEntryDAO");'
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
      return submit(x, (FObject) obj, "p");
      `
    },
    {
      name: 'remove_',
      javaCode: `
      return submit(x, (FObject) obj, "r");
      `
    },
    {
      name: 'submit',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'op',
          type: 'String'
        }
      ],
      type: 'FObject',
      javaCode: `
      ElectoralService electoralService = (ElectoralService) x.get("electoralService");
      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      getLogger().debug("state", electoralService.getState().getLabel());
      if ( electoralService.getState() != ElectoralServiceState.IN_SESSION ||
           ! service.getIsPrimary()) {
        getLogger().warning("Reject put(). primary:", service.getIsPrimary(), ", state:", electoralService.getState().getLabel());
        throw new RuntimeException("Reject put() on non-primary or during election. (primary: " + service.getIsPrimary() + ", state: " + electoralService.getState().getLabel());
      }

      DaggerService daggar = (DaggerService) x.get("daggerService");
      DaggerLinks links = daggar.getNextLinks(x);

      MedusaEntry entry = x.create(MedusaEntry.class);
      entry.setAction(op);
      entry.setGlobalIndex1(links.getLink1().getIndex());
      entry.setHash1(links.getLink1().getHash());
      entry.setGlobalIndex1(links.getLink2().getIndex());
      entry.setHash1(links.getLink2().getHash());
      entry.setIndex(links.getGlobalIndex());
      entry.setNSpecName(getNSpec().getName());

      if ( "p".equals(op) ) {
        entry.setNu(obj);
      } else {
        entry.setOld(obj);
      }
      getLogger().debug("put", "entry", entry);
      entry = (MedusaEntry) getMedusaEntryDAO().put_(x, entry);

      if ( "p".equals(op) ) {
        return entry.getNu();
      } else {
        return entry.getOld();
      }
      `
    }
  ]
});
