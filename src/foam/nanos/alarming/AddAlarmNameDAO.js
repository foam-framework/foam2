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

  methods: [
    {
      name: 'put_',
      javaCode: `
        DAO alarmConfigDAO = (DAO) x.get("alarmConfigDAO");
        AlarmConfig config = (AlarmConfig) alarmConfigDAO.find(EQ(AlarmConfig.NAME, obj.getName()));
        if ( config == null ) {
          AlarmConfig alarmConfig = new AlarmConfig.Builder(getX())
           .setName(configName)
           .build();
          alarmConfigDAO.put(alarmConfig);
        }
        return super.put_(x, obj);
      `
    }
  ]
})
