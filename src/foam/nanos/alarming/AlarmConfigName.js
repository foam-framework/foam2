/**
 * @license
 * Copyright 2020 nanopay Inc. All Rights Reserved.
 */
foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmConfigName',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    }
  ],

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'configName',
          type: 'String'
        }
      ],
      javaCode: `
        DAO alarmConfigDAO = (DAO) getX().get("alarmConfigDAO");
        AlarmConfig config = (AlarmConfig) alarmConfigDAO.find(EQ(AlarmConfig.NAME, configName));
        if ( config == null ) {
          AlarmConfig alarmConfig = new AlarmConfig.Builder(getX())
            .setName(configName)
            .setSendEmail(false)
            .build();
            alarmConfigDAO.put(alarmConfig);
            return;
        }
        if ( ! config.getEnabled() ) {
          return;
        }
        DAO alarmDAO = (DAO) getX().get("alarmDAO");

        Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, config.getName()));
        if ( ! (alarm == null) || alarm.getIsActive() ){
          return;
        }
        alarm = new Alarm.Builder(getX())
          .setName(config.getName())
          .setIsActive(true)
          .build();
        alarmDAO.put(alarm);
      `
    }
  ]
})
