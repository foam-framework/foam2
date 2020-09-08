/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.benchmark',
  name: 'MedusaBenchmark',
  implements: [ 'foam.nanos.bench.Benchmark' ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.bench.Benchmark',
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.StdoutLogger',
    'foam.nanos.medusa.MedusaEntry',
    'foam.nanos.medusa.DaggerService',
    'foam.nanos.medusa.test.MedusaTestObject',
    'static foam.mlang.MLang.EQ',
    'java.util.UUID'
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      value: 'medusaTestObjectDAO'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
      Logger logger = (Logger) getX().get("logger");
      if ( logger == null ) {
        logger = new StdoutLogger();
      }
      return new PrefixLogger(new Object[] {
        this.getClass().getSimpleName()
      }, logger);
      `
    }
  ],

  methods: [
    {
      name: 'setup',
      args: [
        {
          name: 'x',
          type: 'X'
        },
      ],
      javaCode: `
      // nop
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'X'
        },
      ],
      javaCode: `
    AppConfig config = (AppConfig) x.get("appConfig");

    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) {
      return;
    }

    DAO dao = (DAO) x.get(getServiceName());
    MedusaTestObject test = new MedusaTestObject();
    test.setName(UUID.randomUUID().toString());
    test.setDescription("MedusaTestObject");
    dao.put(test);
      `
    },
    {
      name: 'teardown',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'stats',
          type: 'Map'
        }
      ],
      javaCode: `
      // nop
      `
    }
  ]
});
