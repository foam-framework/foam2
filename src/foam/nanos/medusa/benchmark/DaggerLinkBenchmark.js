/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.benchmark',
  name: 'DaggerLinkBenchmark',
  implements: [ 'foam.nanos.bench.Benchmark' ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Language',
    'foam.nanos.bench.Benchmark',
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.StdoutLogger',
    'foam.nanos.medusa.MedusaEntry',
    'foam.nanos.medusa.DaggerService',
    'static foam.mlang.MLang.EQ',
    'java.util.UUID'
  ],

  properties: [
    {
      name: 'sampleSize',
      type: 'Int',
      value: 1000,
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
    DAO dao = (DAO) x.get("languageDAO");
//    for ( int i = 0; i < getSampleSize(); i++ ) {
    for ( int i = 0; i < 1000; i++ ) {
      Language language = new Language();
      language.setCode(UUID.randomUUID().toString());
      language.setName(language.getCode());
      dao.put(language);
    }
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
    DaggerService dagger = (DaggerService) x.get("daggerService");
    MedusaEntry entry = x.create(MedusaEntry.class);
    entry = dagger.link(x, entry);
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
