/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaAdapterDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.nanos.boot.NSpecAware',
  ],

  documentation: `Create a medusa entry for argument model. NOTE:  delegate is parent MDAO, but only used as holder for MedusaEntryRoutingDAO to find.`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DOP',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.nanos.session.Session'
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
      FObject old = getDelegate().find_(x, obj.getProperty("id"));
      return submit(x, (FObject) obj, old, DOP.PUT);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      return submit(x, (FObject) obj, null, DOP.REMOVE);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( foam.dao.MDAO.GET_MDAO_CMD.equals(obj) ) {
        return getDelegate().cmd_(x, obj);
      }
      return getMedusaEntryDAO().cmd_(x, obj);
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
          name: 'old',
          type: 'FObject'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        }
      ],
      type: 'FObject',
      javaCode: `
      PM pm = createPM(x, dop);
      getLogger().debug("submit", dop.getLabel(), obj.getClass().getName());

      // ElectoralService electoralService = (ElectoralService) x.get("electoralService");
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());

      MedusaEntry entry = x.create(MedusaEntry.class);
      entry.setMediator(config.getName());
      entry.setNSpecName(getNSpec().getName());
      entry.setDop(dop);
//      entry.setSessionId(((Session) x.get("session")).getId());
      entry.setData(obj);

      // TODO/REVIEW: to reduce network load, just marshal delta. But this won't work in practise as
      // HashingDAO needs the complete object to generate a hash()
      foam.lib.json.Outputter outputter = new foam.lib.json.Outputter(x).setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
//      String d = ( old != null ) ?
//        outputter.stringifyDelta(old, obj) :
        String d = outputter.stringify(obj);
      // entry.setData(d);
      getLogger().debug("submit", entry.getIndex(), obj.getClass().getSimpleName(), "stringify", d);

//      getLogger().debug("submit", entry.getIndex());

      try {
        FObject data = ((MedusaEntry)getMedusaEntryDAO().put_(x, entry)).getData();
//        ((MedusaEntry)getMedusaEntryDAO().put_(x, entry));
        getLogger().debug("submit", entry.getIndex(), "find", data.getProperty("id"));
        FObject result = getDelegate().find_(x, data.getProperty("id"));
        if ( result == null ) {
          getLogger().error("Object not found", data.getProperty("id"));
          return data;
        }
        getLogger().debug("submit", entry.getIndex(), "found", result.getProperty("id"));
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
          name: 'dop',
          type: 'foam.dao.DOP'
        }
      ],
      javaType: 'PM',
      javaCode: `
    return PM.create(x, this.getOf(), dop.getLabel());
      `
    }
  ]
});
