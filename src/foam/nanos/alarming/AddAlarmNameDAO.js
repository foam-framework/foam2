/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AddAlarmNameDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'DAO that add name to alarmConfig on Alarm.put',

  javaImports: [
    "foam.dao.DAO",
    "foam.nanos.alarming.Alarm",
    "static foam.mlang.MLang.EQ"
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Alarm alarm = (Alarm) obj;
        DAO alarmConfigDAO = (DAO) x.get("alarmConfigDAO");
        AlarmConfig config = (AlarmConfig) alarmConfigDAO.find(EQ(AlarmConfig.NAME, alarm.getName()));
        if ( config == null ) {
          AlarmConfig alarmConfig = new AlarmConfig.Builder(getX())
            .setName(alarm.getName())
            .build();
          alarmConfigDAO.put(alarmConfig);
        }
        return super.put_(x, obj);
      `
    }
  ]
})
