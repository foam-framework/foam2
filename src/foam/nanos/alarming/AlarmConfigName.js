/**
 * @license
 * Copyright 2020 nanopay Inc. All Rights Reserved.
 */
foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmConfigName',
  extends: 'foam.dao.ProxySink',

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
      javaCode: `
        getDelegate().put(obj, sub);

        String name = (String) obj;
        DAO alarmConfigDAO = (DAO) getX().get("AlarmConfigDAO");
        AlarmConfig config = (AlarmConfig) alarmConfigDAO.find(EQ(AlarmConfig.NAME, name));
        if ( config == null || ! config.getEnabled() ) {
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
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          protected foam.dao.DAO dao_;

          public AlarmConfigName(foam.core.X x, foam.dao.Sink delegate, foam.dao.DAO dao) {
            super(x, delegate);
            dao_ = dao;
          }
        `);
      }
    }
  ]
})
