/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.benchmark',
  name: 'DaggerVerifyBenchmark',
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
      class: 'Int',
      value: 1000
    },
    {
      name: 'entries',
      class: 'Int'
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
    for ( int i = 0; i < getSampleSize(); i++ ) {
      Language language = new Language();
      language.setCode(String.valueOf(i));
      language.setName(language.getCode());
      dao.put(language);
    }
    dao = (DAO) x.get("medusaEntryDAO");
    Count count = (Count) dao.select(new Count());
    setEntries((int) count.getValue());
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
    DAO dao = (DAO) x.get("medusaEntryDAO");
    MedusaEntry entry = null;
    for ( int i = 0; i < 10; i++ ) {
      long index = (long) (Math.random() * getEntries());
      if ( index < 3 ) {
        continue;
      }
      entry = (MedusaEntry) dao.find(EQ(MedusaEntry.INDEX, index));
      if ( entry != null ) {
        break;
      }
    }
    if ( entry != null ) {
      try {
        dagger.verify(x, entry);
      } catch ( foam.nanos.medusa.DaggerException e ) {
        getLogger().warning(e.getMessage());
      }
    } else {
      getLogger().warning("Failed to find entry");
    }
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
