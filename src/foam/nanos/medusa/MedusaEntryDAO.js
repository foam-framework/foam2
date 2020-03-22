/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.nanos.boot.NSpecAware',
  ],

  documentation: `Create a medusa object, assign a global index`,

  javaImports: [
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
      name: 'mdao',
      class: 'FObjectProperty',
      of: 'foam.dao.MDAO',
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
      return submit(x, (foam.core.FObject) obj, "p");
      `
    },
    {
      name: 'remove_',
      javaCode: `
      return submit(x, (foam.core.FObject) obj, "r");
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
          type: 'foam.core.FObject'
        },
        {
          name: 'op',
          type: 'String'
        }
      ],
      type: 'foam.core.FObject',
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
      java.util.Random r = ThreadLocalRandom.current();

      MedusaEntry entry = x.create(MedusaEntry.class);
      // TODO: put this in context factory - not sure where to install.
      entry.setId(new UUID(r.nextLong(), r.nextLong()).toString());
      entry.setAction(op);
      entry.setGlobalIndex1(links.getLink1().getIndex());
      entry.setHash1(links.getLink1().getHash());
      entry.setGlobalIndex1(links.getLink2().getIndex());
      entry.setHash1(links.getLink2().getHash());
      entry.setMyIndex(links.getGlobalIndex());
      entry.setNspecKey(getNSpec().getName());

      if ( "p".equals(entry.getAction()) ) {
        entry.setNu(obj);
      } else {
        entry.setOld(obj);
      }

      entry = (MedusaEntry) getDelegate().put_(x, entry);

      if ( "p".equals(entry.getAction()) ) {
        return entry.getNu();
      } else {
        return entry.getOld();
      }
      `
    }
  ]
});
