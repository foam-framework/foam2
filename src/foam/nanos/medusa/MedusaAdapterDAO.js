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

  documentation: `Create a medusa entry for argument model. NOTE:  delegate is real NSpec MDAO.`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DOP',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil'
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
      FObject nu = getDelegate().put_(x, obj);
      return submit(x, (FObject) nu, old, DOP.PUT);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      FObject nu = getDelegate().remove_(x, obj);
      return submit(x, (FObject) nu, null, DOP.REMOVE);
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

      DaggerService dagger = (DaggerService) x.get("daggerService");
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());

      MedusaEntry entry = x.create(MedusaEntry.class);
      entry = dagger.link(x, entry);
      entry.setMediator(config.getName());
      entry.setNSpecName(getNSpec().getName());
      entry.setDop(dop);

      foam.lib.json.Outputter outputter = new foam.lib.json.Outputter(x).setPropertyPredicate(new foam.lib.StoragePropertyPredicate());
      String data = ( old != null ) ?
        outputter.stringifyDelta(old, obj) :
        outputter.stringify(obj);
      entry.setData(data);
      getLogger().debug("submit", entry.getIndex(), obj.getClass().getSimpleName(), "stringify", data);

      try {
        getMedusaEntryDAO().put_(x, entry);
        FObject nu = getDelegate().find_(x, obj.getProperty("id"));
        if ( nu == null ) {
          getLogger().error("submit", entry.getIndex(), "delegate", "find", obj.getProperty("id"), "not found");
          throw new RuntimeException("Object not found.");
        }
        return nu;
      } catch (Throwable t) {
        getLogger().error("submit", entry.getIndex(), t.getMessage(), t);
        throw t;
      } finally {
        pm.log(x);
      }
      `
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
      return PM.create(x, this.getOwnClassInfo(), dop.getLabel());
      `
    }
  ]
});
