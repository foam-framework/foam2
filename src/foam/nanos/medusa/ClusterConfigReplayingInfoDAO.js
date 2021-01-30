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
    'foam.mlang.sink.ArraySink',
    'foam.mlang.sink.Count',
    'foam.nanos.alarming.Alarm',
    'java.lang.Runtime',
    'java.util.ArrayList',
    'java.util.List',
  ],

  properties: [
    {
      name: 'lastAlarms',
      class: 'Map',
      javaFactory: 'return new HashMap()';
    },
    {
      name: 'lastAlarmsSince',
      class: 'Date'
    }
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
        Date now = new Date();
        if ( getLastAlarmsSince() != null ) {
          alarmDAO = alarmDAO.where(
            AND(
              EQ(Alarm.HOSTNAME, System.getProperty("hostname", "localhost")),
              GTE(Alarm.LAST_MODIFIED, getLastAlarmsSince())
            )
          );
        }
        setLastAlarmsSince(now);

        Map nextAlarms = new HashMap();
        List sendAlarms = new ArrayList();
        List<Alarm> alarms = (ArrayList) ((ArraySink) alarmDAO.select(new ArraySink()))).getArray();
        for ( Alarm alarm : alarms ) {
          Alarm lastAlarm = (Alarm) lastAlarms.get(alarm.getId());
          if ( lastAlarm == null && alarm.getIsActive() ||
               lastAlarm != null && alarm.getIsActive() != lastAlarm.getIsActive() ) {
            sendAlarms.add(alarm);
            nextAlarms.put(alarm.getId(), alarm);
          }
        }
        setLastAlarms(nextAlarms);
        config.setAlarms(sendAlarms);

        Runtime runtime = Runtime.getRuntime();
        config.setMemoryMax(runtime.maxMemory());
        config.setMemoryFree(runtime.freeMemory());
      }
      return config;
      `
    }
  ]
});
