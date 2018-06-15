
/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'NotificationLogger',
  extends: 'foam.nanos.logger.ProxyLogger',

  javaImports: [
    'foam.dao.DAO',
    'foam.core.X',
    'java.util.Date',
    'java.text.DateFormat',
],

  requires: [
    'foam.nanos.logger.LogLevel',
    'foam.nanos.notification.Notification',
  ],

  properties: [
    {
      class: 'Int',
      name: 'errorLevelThreshhold',
      value: 12,
    },
    {
      class: 'Enum',
      of: 'foam.nanos.logger.LogLevel',
      name: 'lastLogLevel',
      factory: function() { return foam.nanos.logger.LogLevel.INFO; }
    }
  ],

  methods: [
    {
      name: 'generateNotificationEvent',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: `
            try {
              X x = x_.put("logger", NullLogger.instance() ) ; 
              foam.nanos.notification.Notification notif = new foam.nanos.notification.Notification();
              notif.setUserId(9);
              // s.setGroupId("NOC");
              notif.setEmailIsEnabled(true);
              notif.getEmailArgs().put("type", args);
              notif.setEmailName("notification-logger-error");
              notif.setBody("A notification email was triggered from the nanopay notification logger.");
              if (x.get("notificationDAO") != null) ((DAO) x.get("notificationDAO")).put_(x,notif) ;         
              // if (x_.get("notificationDAO") != null) ((DAO) x_.get("notificationDAO")).put_(x_,notif) ; 
              System.err.print("generateNotificationEventCompleted");
              System.err.print("\\n");
            } catch(Throwable t) {
              System.out.println("DJ NOTIFICATION ERROR MESSAGE: " + t);
            }

      `
    },
  {
    name: 'info',
    args: [
      {
        name: 'args',
        javaType: 'Object...'
      }
    ],
    javaReturns: 'void',
    javaCode: `
    if (LogLevel.INFO.getOrdinal() >= getErrorLevelThreshhold() ) {
      generateNotificationEvent(args);
      System.err.print("info notification email sent");
    }
    getDelegate().info(args);          

    `
},
{
  name: 'warning',
  args: [
    {
      name: 'args',
      javaType: 'Object...'
    }
  ],
  javaReturns: 'void',
  javaCode: `
  if (LogLevel.WARNING.getOrdinal() >= getErrorLevelThreshhold() ) {
    Thread.dumpStack();
    generateNotificationEvent(args);
    System.err.print("warning notification email sent");      
  }
  getDelegate().warning(args);          
  `
},
{
name: 'error',
args: [
  {
    name: 'args',
    javaType: 'Object...'
  }
],
javaReturns: 'void',
javaCode: `
if (LogLevel.ERROR.getOrdinal() >= getErrorLevelThreshhold() ) {
  generateNotificationEvent(args);
  System.err.print("error notification email sent");    
}
getDelegate().error(args);          

`
},



  ]
});

