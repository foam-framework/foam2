/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AddAlarmNameDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `DAO that add name to alarmConfig on Alarm.put. Used to help keep truck of
  newly added alarms.`,

  javaImports: [
    "foam.dao.DAO",
    "foam.nanos.alarming.Alarm",
    "foam.nanos.logger.Logger",
    "static foam.mlang.MLang.EQ"
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Alarm alarm = (Alarm) obj;
        Logger logger = (Logger) x.get("logger");
        DAO alarmConfigDAO = (DAO) x.get("alarmConfigDAO");
        AlarmConfig config = (AlarmConfig) alarmConfigDAO.find(EQ(AlarmConfig.NAME, alarm.getName()));
        try {
          if ( config == null ) {
            AlarmConfig alarmConfig = new AlarmConfig.Builder(x)
              .setName(alarm.getName())
              .build();
            alarmConfigDAO.put(alarmConfig);
          }
        } catch ( Exception e ) {
          logger.error("Error adding new alarm config" + e);
        }
        return super.put_(x, obj);
      `
    }
  ]
})
