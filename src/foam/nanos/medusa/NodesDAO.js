/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'NodesDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Write MedusaEntry to the Medusa Nodes`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],
  
  properties: [
    {
      class: 'Object',
      name: 'line',
      javaType: 'foam.util.concurrent.AssemblyLine',
      javaFactory: 'return new foam.util.concurrent.SyncAssemblyLine();'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger',
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);
      `
    },
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      // using assembly line, write to all online nodes - in all a zones.
      List<ClusterConfig> arr = (ArrayList) ((ArraySink) ((DAO) x.get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.TYPE, MedusaType.NODE),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.ONLINE, true)
          )
        )
        .orderBy(ClusterConfig.ZONE)
        .select(new ArraySink())).getArray();
      for ( ClusterConfig config : arr ) {
        getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {
          public void executeJob() {
            try {
              DAO dao = new MedusaEntryClientDAO.Builder(x)
                .setClusterConfig(config)
                .build();
              dao.put_(x, obj);
            } catch ( Throwable t ) {
              getLogger().error(t);
            }
          }
        });
      }
      return obj;
      `
    }
  ]
});
