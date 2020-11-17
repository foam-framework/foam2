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
    'foam.nanos.logger.Logger',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Alarm alarm = (Alarm) getDelegate().put_(x, obj);
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
