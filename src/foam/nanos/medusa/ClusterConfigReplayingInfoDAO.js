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
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      if ( config != null &&
           replaying != null ) {

        config = (ClusterConfig) config.fclone();
        config.setReplayingInfo(replaying);

        Count alarms = (Count) ((DAO) x.get("alarmDAO"))
          .where(EQ(Alarm.IS_ACTIVE, true))
          .select(COUNT());
        config.setAlarms(((Long) alarms.getValue()).intValue());

        Runtime runtime = Runtime.getRuntime();
        config.setMemoryMax(runtime.maxMemory());
        config.setMemoryFree(runtime.freeMemory());
      }
      return config;
      `
    }
  ]
});
