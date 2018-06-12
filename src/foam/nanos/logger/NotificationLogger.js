
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
        value: 2,
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
        javaCode: `
            X x = getX();
            foam.nanos.notification.Notification s = new foam.nanos.notification.Notification();
            // s.setUserId(9);
            s.setGroupId("NOC");
            s.setEmailIsEnabled(true);
            s.setEmailName("notification-logger-error");
            s.setBody("A notification email was triggered from the nanopay notification logger.");
            if (x.get("notificationDAO") != null) ((DAO) x.get("notificationDAO")).put_(x,s) ;
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
        generateNotificationEvent();
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
      generateNotificationEvent();
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
    generateNotificationEvent();
    System.err.print("error notification email sent");    
  }
  getDelegate().error(args);          
  
  `
},



    ]
  });
