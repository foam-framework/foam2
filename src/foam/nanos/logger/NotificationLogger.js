
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
    'foam.core.X'
  ],

  requires: [
    'foam.nanos.logger.LogLevel',
    'foam.nanos.notification.Notification',
  ],

  properties: [
    {
      class: 'Int',
      name: 'errorLevelThreshhold',
      value: 1,
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
          name: 'type',
          javaType: 'String'
        },
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: `
  X x = x_.put("logger", NullLogger.instance() ) ; 
  
  String message = "";
  foam.nanos.notification.Notification notif = new foam.nanos.notification.Notification();
  for ( int i = 0 ; i < args.length ; i++ ) {
    message = message + args[i] + " ";  
  }
  
  notif.setEmailIsEnabled(true);
  // notif.setGroupId("NOC");
  notif.setUserId(9);
  notif.getEmailArgs().put("type", type);
  notif.getEmailArgs().put("message", message);
  notif.setEmailName("notification-logger-error");
  if (x.get("notificationDAO") != null) ((DAO) x.get("notificationDAO")).put_(x,notif) ;         
  // System.err.print("generateNotificationEventCompleted");
  // System.err.print("\\n");
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
    String logLevel = "An info";
    generateNotificationEvent(logLevel,args);
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
    String logLevel = "A warning";
    generateNotificationEvent(logLevel,args);
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
    String logLevel = "An error";  
    generateNotificationEvent(logLevel,args);
  }
  getDelegate().error(args);          
`
  },
  ]
});

