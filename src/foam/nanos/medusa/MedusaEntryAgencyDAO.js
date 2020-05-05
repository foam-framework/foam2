/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryAgencyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Handoff delegate calls to a threadpool.`,

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.dao.DOP',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
  ],

  properties: [
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
      MedusaEntry entry = (MedusaEntry) obj;
      getLogger().debug("put", entry.getIndex());
      ContextAgent agent = new MedusaEntryAgent(x, DOP.PUT, entry, getDelegate());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ((Agency) x.get(support.getThreadPoolName())).submit(x, agent, "MedusaEntryAgent-"+obj.getClass().getSimpleName());
      return entry;
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      getLogger().debug("cmd", obj.getClass().getSimpleName());
      ContextAgent agent = new MedusaEntryAgent(x, DOP.CMD, obj, getDelegate());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ((Agency) x.get(support.getThreadPoolName())).submit(x, agent, "MedusaEntryAgent-"+obj.getClass().getSimpleName());
      return obj;
      `
    }
  ]
});
