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
//    'foam.nanos.boot.NSpecAware',
  ],

  documentation: `Create a medusa entry for argument model.`,

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
      name: 'clientDAO',
      class: 'FObjectProperty',
      of: 'foam.dao.DAO',
      javaFactory: `
      return new foam.nanos.medusa.ClusterClientDAO.Builder(getX())
        .setNSpec(getNSpec())
        .setDelegate(new foam.dao.NullDAO(getX(), getDelegate().getOf()))
        .build();
      `
    },
    {
      // TODO: clear on ClusterConfigDAO update.
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig',
      javaFactory: `
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      return support.getConfig(getX(), support.getConfigId());
      `
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
      documentation: `
      1. If primary mediator, then delegate to medusaAdapter, accept result.
      2. If secondary mediator, proxy to next 'server', find result.
      3. If not mediator, proxy to the next 'server', put result.`,
      name: 'put_',
      javaCode: `
      // TODO/REVIEW: does Clusterable make sense?
      if ( obj instanceof Clusterable &&
           ! ((Clusterable) obj).getClusterable() ) {
        getLogger().debug("put", "not clusterable", obj.getProperty("id"));
        return getDelegate().put_(x, obj);
      }
      if ( getConfig().getIsPrimary() ) {
        getLogger().debug("put", "primary", obj.getProperty("id"));
        FObject old = getDelegate().find_(x, obj.getProperty("id"));
        FObject nu = getDelegate().put_(x, obj);
        return submit(x, nu, old, DOP.PUT);
      }
      getLogger().debug("put", "client", obj.getProperty("id"));
      FObject result = getClientDAO().put_(x, obj);
      if ( getConfig().getType() == MedusaType.MEDIATOR ) {
        FObject found = getDelegate().find_(x, obj.getProperty("id"));
        if ( found == null) {
          // FIXME: In Zone 1+, it would appear the client returns before the broadcast finishes.
          getLogger().error("put", "client", "delegate.find", "NOT FOUND", obj.getProperty("id"));
          return result;
        }
        return found;
      }
      getLogger().debug("put", "client", "delegate.put", obj.getProperty("id"));
      return getDelegate().put_(x, result);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      // TODO/REVIEW: does Clusterable make sense?
      if ( obj instanceof Clusterable &&
           ! ((Clusterable) obj).getClusterable() ) {
        return getDelegate().remove_(x, obj);
      }
      if ( getConfig().getIsPrimary() ) {
        getDelegate().remove_(x, obj);
        return submit(x, obj, null, DOP.REMOVE);
      }
      FObject result = getClientDAO().remove_(x, obj);
      if ( getConfig().getType() == MedusaType.MEDIATOR ) {
        return result;
      }
      return getDelegate().remove_(x, result);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( getConfig().getIsPrimary() ) {
        if ( ClusterServerDAO.GET_CLIENT_CMD.equals(obj) ) {
          getLogger().debug("cmd", "GET_CLIENT_CMD");
          return this;
        }
        if ( obj instanceof ClusterCommand ) {
          ClusterCommand cmd = (ClusterCommand) obj;
          getLogger().debug("cmd", "ClusterCommand");

          if ( DOP.PUT == cmd.getDop() ) {
            cmd.setData(put_(x, cmd.getData()));
          } else if ( DOP.REMOVE == cmd.getDop() ) {
            cmd.setData(remove_(x, cmd.getData()));
          } else {
            getLogger().warning("Unsupported operation", cmd.getDop().getLabel());
            throw new UnsupportedOperationException(cmd.getDop().getLabel());
          }
          return cmd;
        }
      }
      if ( foam.dao.MDAO.GET_MDAO_CMD.equals(obj) ) {
        return getDelegate().cmd_(x, obj);
      }
      return getClientDAO().cmd_(x, obj);
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
