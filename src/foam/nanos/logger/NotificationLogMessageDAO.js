/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'NotificationLogMessageDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.core.X',
  ],

  requires: [
    'foam.nanos.logger.LogLevel',
    'foam.nanos.notification.Notification',
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'Enum',
      of: 'foam.nanos.logger.LogLevel',
      name: 'threshold',
      value: 'INFO',
      factory: function() {
        return foam.nanos.logger.LogLevel.ERROR;
      },
      documentation: `The value of errorLevelThreshhold control when this logger executes.
      Ordinal values for LogLevels are: DEBUG -> 0, INFO -> 1, WARNING -> 2, ERROR -> 3.
      The equality condition for execution is greater than or equal to errorLevelThreshhold.`
    },
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
`protected ThreadLocal<Boolean> currentlyLogging = new ThreadLocal<Boolean>() {
  @Override
  protected Boolean initialValue() {
    return false;
  }
};`
        }));
      }
    }
  ],

  methods: [
    {
      name: 'generateNotificationEvent',
      code: function(message) {

      },
      args: [
        {
          name: 'log',
          javaType: 'foam.nanos.logger.LogMessage'
        },
      ],
      javaCode: `
  if (currentlyLogging.get()) {
    return;
  }
  currentlyLogging.set(true);

  try {
    foam.nanos.notification.Notification notif = new foam.nanos.notification.Notification();
    notif.setProfile(this.getClass().getSimpleName());

    String message = log.getSeverity().getName() + ": " + log.getMessage();
    notif.setBody(message);

    if (x_.get("notificationDAO") != null) ((DAO) x_.get("notificationDAO")).put_(x_,notif) ;
  }
  catch (Throwable t) {
    t.printStackTrace();
  }
  currentlyLogging.set(false);
  `
    },
    {
      name: 'put_',
      code: function(x, obj) {
        if ( obj.severity.ordinal <= this.threshold.ordinal ) {
          generateNotificationEvent(obj);
        }
        return this.SUPER(x, obj);
      },
      javaCode: `
        LogMessage log = (LogMessage) obj;
        if ( log.getSeverity().getOrdinal() <= getThreshold().getOrdinal() ) {
          generateNotificationEvent(log);
        }
        return super.put_(x, obj);
      `
    }
  ]
});
