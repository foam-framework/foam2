foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'Alarming',

  documentation: 'Send Alert Notifications on alarm',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
    
      DAO configDAO = (DAO) x.get("alarmConfigDAO");
      Logger logger = (Logger) x.get("logger");

      Alarm old = (Alarm) oldObj;
      Alarm newAlarm = (Alarm) obj;
      AlarmConfig config = (AlarmConfig) configDAO.find(EQ(AlarmConfig.NAME, newAlarm.getName()));
      
      if ( config == null || ! config.getEnabled() ) {
        logger.warning("No Alarm config found for " + newAlarm.getName());
        return;
      }
      
      if ( old == null && newAlarm.getIsActive() || old != null && (! old.getIsActive()) && newAlarm.getIsActive() ) {
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            try {
              Notification notification = new Notification();
              notification.setBody("An alarm has been triggered for " + config.getName());

              // Notify a user
              User user = (User) ((DAO) x.get("localUserDAO")).find(config.getAlertUser());
              if ( user != null )
                user.doNotify(x, notification);
              // Notify a group when set
              if ( foam.util.SafetyUtil.isEmpty(config.getAlertGroup()) ) 
                return;
              notification.setGroupId(config.getAlertGroup());
              ((DAO) x.get("localNotificationDAO")).put(notification);
            } catch (Exception e) {
              logger.error(e);
            }
          }
        }, "Alarming");
      }
     `
    }
  ]

});
