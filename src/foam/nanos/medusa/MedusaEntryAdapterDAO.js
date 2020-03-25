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

  // TODO: deal with retries.

  documentation: `Create a medusa entry for argument model. NOTE:  delegate is parent MDAO, but only used as holder for MedusaEntryRoutingDAO to find.`,

  javaImports: [
    'foam.core.FObject',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Random',
    'java.util.UUID'
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
      FObject o = submit(x, (FObject) obj, "p");
      return getDelegate().put_(x, o);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      FObject o = submit(x, (FObject) obj, "r");
      return getDelegate().remove_(x, o);
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

      MedusaEntry entry = x.create(MedusaEntry.class);

      java.util.Random r = ThreadLocalRandom.current();
      entry.setId(new UUID(r.nextLong(), r.nextLong()).toString());

      DaggerService daggar = (DaggerService) x.get("daggerService");
      entry = daggar.link(x, entry);

      entry.setMediator(service.getConfigId());
      entry.setNSpecName(getNSpec().getName());
      entry.setAction(op);
      entry.setData(obj);
      getLogger().debug("put", "entry", entry);

      return ((MedusaEntry)getMedusaEntryDAO().put_(x, entry)).getData();
      `
    }
  ]
});
