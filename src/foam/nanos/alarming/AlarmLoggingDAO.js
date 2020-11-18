/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmLoggingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Generate Logger messages for each alarm`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Alarm old = (Alarm) getDelegate().find_(x, ((Alarm)obj).getId());
      Alarm alarm = (Alarm) getDelegate().put_(x, obj);
      if ( old != null &&
           old.getIsActive() == alarm.getIsActive() ) {
        return alarm;
      }

      Logger logger = (Logger) x.get("logger");
      switch ( alarm.getSeverity() ) {
        case DEBUG:
          logger.debug("Alarm", alarm.getName(), alarm.getIsActive(), alarm.getNote());
          break;
        case INFO:
          logger.info("Alarm", alarm.getName(), alarm.getIsActive(), alarm.getNote());
          break;
        case WARN:
          logger.warning("Alarm", alarm.getName(), alarm.getIsActive(), alarm.getNote());
          break;
        case ERROR:
          logger.error("Alarm", alarm.getName(), alarm.getIsActive(), alarm.getNote());
          if ( alarm.getIsActive() ) {
            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setToastMessage(alarm.getName())
              .setBody(alarm.getNote())
              .build();
              ((DAO) x.get("localNotificationDAO")).put(notification);
          }
          break;
        default:
          logger.info("Alarm", alarm.getName(), alarm.getIsActive(), alarm.getNote());
          break;
      }
      return alarm;
      `
    }
  ]
});
