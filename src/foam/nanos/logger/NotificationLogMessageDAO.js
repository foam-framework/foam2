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

  imports: [
    'notificationDAO'
  ],

  javaImports: [
    'foam.dao.DAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.notification.Notification',
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: false
    },
    {
      class: 'Enum',
      of: 'foam.log.LogLevel',
      name: 'threshold',
      factory: function() {
        return foam.log.LogLevel.ERROR;
      },
      javaFactory: `
        return foam.log.LogLevel.ERROR;
`,
      documentation: `The value of Threshhold control when this logger executes.
      Ordinal values for LogLevels are: DEBUG -> 0, INFO -> 1, WARNING -> 2, ERROR -> 3.
      The equality condition for execution is greater than or equal to Threshhold.`
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
      code: function(x, log) {
        var notif = foam.nanos.notification.Notification.create({
          template: this.cls_,
          body: log.severity.name + ': ' + log.message
        });
        this.notificationDAO.put_(x, notif);
      },
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'log',
          type: 'foam.nanos.logger.LogMessage'
        },
      ],
      javaCode: `
  if (currentlyLogging.get()) {
    return;
  }
  currentlyLogging.set(true);

  try {
    foam.nanos.notification.Notification notif = new foam.nanos.notification.Notification();
    notif.setTemplate(this.getClass().getSimpleName());

    String message = log.getSeverity().getName() + ": " + log.getMessage();
    notif.setBody(message);

    if (x.get("notificationDAO") != null) ((DAO) x.get("notificationDAO")).put_(x, notif) ;
  }
  catch (Throwable t) {
    System.err.println(t.getMessage());
    t.printStackTrace();
  }
  currentlyLogging.set(false);
  `
    },
    {
      name: 'put_',
      code: function(x, obj) {
        if ( this.enabled &&
             obj.severity.ordinal <= this.threshold.ordinal ) {
          generateNotificationEvent(x, obj);
        }
        return this.SUPER(x, obj);
      },
      javaCode: `
        LogMessage log = (LogMessage) obj;
        if ( getEnabled() &&
             log.getSeverity().getOrdinal() <= getThreshold().getOrdinal() ) {
          generateNotificationEvent(x, log);
        }
        return super.put_(x, obj);
      `
    }
  ]
});
