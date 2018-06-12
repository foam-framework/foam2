
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
        // args: [
        //   {
        //     name: 'currentThreshhold',
        //     javaType: 'Enum'
        //   },
        //   {
        //     name: 'updateLastLogLevel',
        //     javaType: 'Boolean'
        //   },
        //   {
        //     name: 'args',
        //     javaType: 'Object...'
        //   },
        // ],
//        javaReturns: 'void',
        javaCode: `

            X x = getX();
            foam.nanos.notification.Notification s = new foam.nanos.notification.Notification();
            s.setUserId(9);
            s.setEmailIsEnabled(true);
        //    s.setGroupId("NOC");
            s.setEmailName("notification-logger-error");
            s.setBody("A notification email was triggered from the nanopay notification logger.");
            ((DAO) x.get("notificationDAO")).put_(x,s) ;
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
        System.err.print(args);
        getDelegate().info(args);          
        if (LogLevel.INFO.getOrdinal() >= getErrorLevelThreshhold() ) {
          System.err.print("generate notification event");
          generateNotificationEvent();
        }
        `
    },



    ]
  });
