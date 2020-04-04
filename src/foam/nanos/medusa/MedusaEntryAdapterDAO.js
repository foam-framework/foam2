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
    'foam.nanos.pm.PM'
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
          this.getClass().getSimpleName(),
          getNSpec().getName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      return submit(x, (FObject) obj, MedusaEntry.PUT);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      return submit(x, (FObject) obj, MedusaEntry.REMOVE);
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
      PM pm = createPM(x, op);
      ElectoralService electoralService = (ElectoralService) x.get("electoralService");
      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      getLogger().debug("submit", "state", electoralService.getState().getLabel());
      if ( service.getOnline(x) &&
           electoralService.getState() != ElectoralServiceState.IN_SESSION ||
           ! service.getIsPrimary()) {
        getLogger().warning("Reject put(). primary:", service.getIsPrimary(), ", state:", electoralService.getState().getLabel(), obj);
        throw new RuntimeException("Reject put() on non-primary or during election. (primary: " + service.getIsPrimary() + ", state: " + electoralService.getState().getLabel());
      }

      MedusaEntry entry = x.create(MedusaEntry.class);
      entry.setMediator(service.getConfigId());
      entry.setNSpecName(getNSpec().getName());
      entry.setAction(op);
      entry.setData(obj);

      getLogger().debug("submit", entry.getIndex());

      try {
        FObject data = ((MedusaEntry)getMedusaEntryDAO().put_(x, entry)).getData();
        getLogger().debug("submit", entry.getIndex(), "find", data.getProperty("id"));
        FObject result = getDelegate().find_(x, data.getProperty("id"));
        if ( result == null ) {
          getLogger().error("Object not found", data.getProperty("id"));
          return data;
        } else {
          getLogger().debug("submit", entry.getIndex(), "found", result.getProperty("id"));
        }
        return result;
      } catch (Throwable t) {
        getLogger().error("submit", t.getMessage(), entry, t);
        throw t;
      } finally {
        pm.log(x);
      }
      `
    },

    // PMs
    {
      name: 'putName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":Medusa:put";',
      visibility: 'RO'
    },
    {
      name: 'createPM',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'op',
          type: 'String'
        }
      ],
      javaType: 'PM',
      javaCode: `
    return PM.create(x, this.getOf(), op);
      `
    }
  ]
});
