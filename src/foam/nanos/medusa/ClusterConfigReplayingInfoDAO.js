/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigReplayingInfoDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Return ReplayingInfo for this instance`,

  javaImports: [
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'foam.mlang.sink.Count',
    'foam.nanos.alarming.Alarm',
    'java.lang.Runtime'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
      ClusterConfig config = (ClusterConfig) getDelegate().find_(x, id);
      if ( config != null ) {
        config = (ClusterConfig) config.fclone();

        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        config.setReplayingInfo(replaying);

        DAO alarmDAO = (DAO) x.get("alarmDAO");
        alarmDAO = alarmDAO.where(
          AND(
            EQ(Alarm.HOSTNAME, System.getProperty("hostname", "localhost")),
            EQ(Alarm.SEVERITY, LogLevel.ERROR),
            EQ(Alarm.IS_ACTIVE, true)
          )
        );
        Count count = (Count) alarmDAO.select(COUNT());
        if ( count != null ) {
          config.setAlarms(((Long) count.getValue()).intValue());
        }

        Runtime runtime = Runtime.getRuntime();
        config.setMemoryMax(runtime.maxMemory());
        config.setMemoryFree(runtime.freeMemory());
      }
      return config;
      `
    }
  ]
});
