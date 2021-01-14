/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaSigningDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Sign entry`,

  javaImports: [
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
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      if ( myConfig.getRegionStatus() == RegionStatus.ACTIVE ) {
        getLogger().debug("put", entry.getIndex());
        DaggerService service = (DaggerService) x.get("daggerService");
        try {
          entry.setSignature(service.sign(x, entry));
        } catch ( Exception e ) {
          getLogger().error(e);
          // TODO: Alarm
          // Who will catch this.
          throw new RuntimeException(e);
        }
      }
      return getDelegate().put_(x, entry);
      `
    }
  ]
});
